# T-16: 案件詳細画面へのAIアシストセクション追加

## 前提チケット
T-15（raw_text保存）

## 概要
案件詳細・編集画面（`/jobs/[id]`）にAIアシストセクションを追加する。「営業メールを作成」「提案書の構成を作成」「自己PR文を生成」の3ボタンを設置し、押すと案件情報（raw_text・タイトル・単価・スキルタグ・概要）を元にGPT-4oがドラフトを生成して画面内に表示する。

---

## 実装内容

### 1. API Route `app/api/ai-assist/route.ts`（新規作成）

```ts
// POST /api/ai-assist
// リクエスト
type RequestBody = {
  type: 'sales_email' | 'proposal_outline' | 'self_pr'
  jobInfo: {
    title: string | null
    rate: string | null
    tags: string[]
    summary: string | null
    raw_text: string | null
  }
}

// レスポンス
type ResponseBody = {
  result: string   // 生成されたドラフトテキスト
  error?: string
}
```

#### タイプ別プロンプト

**sales_email（営業メール）**
```
あなたはフリーランスエンジニアの営業メール作成を支援するアシスタントです。
以下の案件情報をもとに、案件への応募・問い合わせメールのドラフトを日本語で作成してください。
件名と本文を含めてください。自然でビジネス丁寧語の文体にしてください。

案件情報:
{jobInfo}
```

**proposal_outline（提案書の構成）**
```
あなたはフリーランスエンジニアの提案書作成を支援するアシスタントです。
以下の案件情報をもとに、提案書の構成案（見出しと各セクションの要点）を日本語で作成してください。

案件情報:
{jobInfo}
```

**self_pr（自己PR文）**
```
あなたはフリーランスエンジニアの自己PR文作成を支援するアシスタントです。
以下の案件情報をもとに、この案件に応募する際の自己PR文のドラフトを日本語で作成してください。
200〜400字程度でまとめてください。

案件情報:
{jobInfo}
```

#### 実装のポイント
- モデル: `gpt-4o`
- `OPENAI_API_KEY` は `.env.local` から読み込む（サーバーサイドのみ）
- `raw_text` がある場合は全文を `jobInfo` に含め、ない場合は `summary` で代替する
- タイムアウト: `AbortSignal.timeout(20000)`（20秒）
- エラー時は `{ error: string }` を返す

### 2. `app/jobs/[id]/AiAssistSection.tsx`（新規作成・Client Component）

```tsx
'use client'

type Props = {
  jobInfo: {
    title: string | null
    rate: string | null
    tags: string[]
    summary: string | null
    raw_text: string | null
  }
}

export function AiAssistSection({ jobInfo }: Props) {
  const [activeType, setActiveType] = useState<
    'sales_email' | 'proposal_outline' | 'self_pr' | null
  >(null)
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(type: typeof activeType) {
    setActiveType(type)
    setIsLoading(true)
    setResult('')
    setError('')
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, jobInfo }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.result)
      }
    } catch {
      setError('生成中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4"
      style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}>
      <h2 className="text-sm font-semibold" style={{ color: '#0F172A' }}>
        AIアシスト
      </h2>
      {/* 3ボタン */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" isLoading={isLoading && activeType === 'sales_email'}
          disabled={isLoading} onClick={() => handleGenerate('sales_email')}>
          営業メールを作成
        </Button>
        <Button type="button" variant="secondary" isLoading={isLoading && activeType === 'proposal_outline'}
          disabled={isLoading} onClick={() => handleGenerate('proposal_outline')}>
          提案書の構成を作成
        </Button>
        <Button type="button" variant="secondary" isLoading={isLoading && activeType === 'self_pr'}
          disabled={isLoading} onClick={() => handleGenerate('self_pr')}>
          自己PR文を生成
        </Button>
      </div>

      {/* 結果表示 */}
      {result && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <pre className="whitespace-pre-wrap text-sm rounded-md border p-3"
              style={{ borderColor: '#E2E8F0', color: '#0F172A', backgroundColor: '#F8FAFC' }}>
              {result}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="absolute top-2 right-2 text-xs rounded px-2 py-1 hover:bg-[#E2E8F0] transition-colors"
              style={{ color: '#64748B' }}
            >
              コピー
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>
      )}
    </div>
  )
}
```

### 3. `app/jobs/[id]/page.tsx` の更新

`AiAssistSection` を `JobEditForm` の下に追加する:

```tsx
import { AiAssistSection } from './AiAssistSection'

// JobDetailPage 内
return (
  <div className="flex flex-col gap-6">
    <JobEditForm job={job} />
    <AiAssistSection jobInfo={{
      title: job.title,
      rate: job.rate,
      tags: job.tags,
      summary: job.summary,
      raw_text: job.raw_text,
    }} />
  </div>
)
```

### 対象ファイル
- `app/api/ai-assist/route.ts`（新規作成）
- `app/jobs/[id]/AiAssistSection.tsx`（新規作成）
- `app/jobs/[id]/page.tsx`（`AiAssistSection` を追加）

---

## 完了条件
- [ ] 詳細画面にAIアシストセクションが表示される
- [ ] 3ボタンそれぞれでGPT-4oが対応するドラフトを生成して表示される
- [ ] `raw_text` がある案件では元テキストが活用され、ない案件では `summary` で代替される
- [ ] 生成結果の「コピー」ボタンでクリップボードにコピーできる
- [ ] 生成中はボタンにローディングスピナーが表示され、他のボタンも無効化される
- [ ] エラー時にメッセージが表示される
- [ ] `npm run build` でビルドエラーがない

## 注意事項
- `OPENAI_API_KEY` は `NEXT_PUBLIC_` をつけずサーバーサイドのみで使用する
- `raw_text` は長文になりうるため、GPT-4oに渡す際は先頭3000文字にトリムしてトークン節約する（T-14 と同様の方針）
- 生成結果はDBに保存しない（都度生成する設計）
- `AiAssistSection` はフォームの外側に配置する（`<form>` タグ内に入れない）
