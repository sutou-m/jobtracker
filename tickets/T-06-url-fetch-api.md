# T-06: URL自動取得 Route Handler

## 前提チケット
T-01（DBスキーマ・型定義）

## 概要
ユーザーが貼り付けた案件URLからメタ情報（タイトル・概要・サイト種別）をサーバー側でベストエフォート取得するAPIを実装する。取得失敗時は空のフォームへフォールバックし、アプリが止まらないようにする。

## 実装内容

### 1. `app/api/fetch-job/route.ts` — Route Handler

```ts
import { NextRequest, NextResponse } from 'next/server'
import { JobSource } from '@/types/database'

function detectSource(url: string): JobSource {
  if (url.includes('indeed.com')) return 'indeed'
  if (url.includes('lancers.jp')) return 'lancers'
  if (url.includes('findy.io') || url.includes('findy-code.io')) return 'findy'
  if (url.includes('wantedly.com')) return 'wantedly'
  return 'other'
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URLが不正です' }, { status: 400 })
  }

  const source = detectSource(url)

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000), // 8秒タイムアウト
    })

    if (!res.ok) {
      return NextResponse.json({ source, title: null, summary: null })
    }

    const html = await res.text()

    const title =
      html.match(/<meta property="og:title" content="([^"]*)"/)?.[ 1] ||
      html.match(/<title>([^<]*)<\/title>/)?.[ 1] ||
      null

    const summary =
      html.match(/<meta property="og:description" content="([^"]*)"/)?.[ 1] ||
      html.match(/<meta name="description" content="([^"]*)"/)?.[ 1] ||
      null

    return NextResponse.json({
      source,
      title: title?.trim() ?? null,
      summary: summary?.trim() ?? null,
    })
  } catch {
    // タイムアウト・ネットワークエラー・bot対策等はすべてフォールバック
    return NextResponse.json({ source, title: null, summary: null })
  }
}
```

### 2. サポートするメタ情報
- `og:title` → タイトル
- `og:description` → 概要
- `<title>` タグ → タイトルのフォールバック
- `meta name="description"` → 概要のフォールバック
- URLドメインからサイト種別を自動判定

### 3. レスポンス形式

```ts
// 成功時（情報が取れなくてもエラーにしない）
{
  source: 'indeed' | 'lancers' | 'findy' | 'wantedly' | 'other',
  title: string | null,
  summary: string | null,
}

// URLバリデーション失敗のみ 400 を返す
{ error: 'URLが不正です' }
```

### 対象ファイル
- `app/api/fetch-job/route.ts`（新規作成）

## 完了条件
- [ ] `POST /api/fetch-job` に `{ url: "https://..." }` を送ると、source・title・summaryが返る
- [ ] 取得失敗（タイムアウト・bot対策・ログイン必須）の場合も `{ source, title: null, summary: null }` が返り、500にならない
- [ ] URLのドメインからサイト種別（indeed/lancers/findy/wantedly/other）が正しく判定される
- [ ] Indeed、ランサーズ、Findy、Wantedlyの実際の案件URLで動作確認済み（成功・失敗どちらも想定内）

## 注意事項
- **本APIは「ユーザーが手動で見つけた1件のURLのみ」を対象とする。サイト内の複数URLを巡回・一括取得する実装は絶対に行わない**（indeed / ランサーズ / Wantedly は利用規約でボット・スクレイパーを禁止しており、Findyも公式APIを提供していないため）
- 1ユーザー操作につき1リクエストのみ。過度なリトライや高頻度アクセスの実装は不可
- 多くの案件サイトはCSRまたはログイン必須のため、取得失敗が「正常系」である。失敗しても `null` を返してフォームを空表示するだけでよい
- HTMLパースは軽量な正規表現で十分。`cheerio` 等の外部パーサーは導入しない（バンドルサイズ・依存関係増加を避けるため）
- User-Agentは通常のブラウザに近い値を使うが、ログイン必須・JS必須ページは諦める
- タイムアウトは8秒（ユーザーが長時間待たないよう）
