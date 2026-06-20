# T-09: 一覧フィルタ・検索機能

## 前提チケット
T-05（案件一覧画面）

## 概要
案件一覧にフィルタ（ステータス・サイト種別・タグ）とキーワード検索、ソート機能を追加する。URL SearchParamsベースで実装し、Server ComponentのSSRを維持したまま実装する。

## 実装内容

### 1. 実装アプローチ
URL SearchParamsを使ったサーバーサイドフィルタリング:

```
/?status=applied&source=indeed&q=React&sort=updated_at
```

- `status`: `not_applied` | `applied` | `interview` | `won` | `declined`
- `source`: `indeed` | `lancers` | `findy` | `wantedly` | `other`
- `q`: キーワード（タイトル・概要のLIKE検索）
- `sort`: `created_at`（新着順）| `updated_at`（更新順）

### 2. `app/page.tsx` の更新

```tsx
type SearchParams = {
  status?: string
  source?: string
  q?: string
  sort?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status, source, q, sort } = await searchParams

  let query = supabase.from('job_postings').select('*')

  if (status) query = query.eq('status', status)
  if (source) query = query.eq('source', source)
  if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
  
  const sortColumn = sort === 'updated_at' ? 'updated_at' : 'created_at'
  query = query.order(sortColumn, { ascending: false })

  const { data: jobs, error } = await query
  // ...
}
```

### 3. `components/FilterBar.tsx` — Client Component

フィルタUIのみClient Component化（`'use client'`）:

- ステータスフィルタ: 全ステータスのボタン/セレクト
- サイト種別フィルタ: 全種別のボタン/セレクト
- キーワード検索: テキスト入力（デバウンスあり 300ms）
- ソート切り替え: 「新着順」「更新順」
- 「フィルタをリセット」ボタン

`useRouter` + `useSearchParams` でURLを更新する:

```tsx
const router = useRouter()
const searchParams = useSearchParams()

function updateFilter(key: string, value: string) {
  const params = new URLSearchParams(searchParams.toString())
  if (value) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
  router.push(`/?${params.toString()}`)
}
```

### 4. 件数表示
- 「〇 件」をフィルタ結果の件数に更新

### 5. アクティブフィルタのビジュアル
- 選択中のフィルタをバッジで表示し、× で個別解除

### 対象ファイル
- `app/page.tsx`（更新）
- `components/FilterBar.tsx`（新規作成）

## 完了条件
- [ ] ステータスでフィルタすると一致する案件のみ表示される
- [ ] サイト種別でフィルタできる
- [ ] キーワード検索でタイトル・概要の部分一致が動作する
- [ ] 「新着順」「更新順」の切り替えが動作する
- [ ] フィルタ条件がURLに反映されるため、ページリロードしても条件が保持される
- [ ] 「フィルタをリセット」で全条件がクリアされる

## 注意事項
- Next.js 15以降では `searchParams` も `Promise` になっているため `await searchParams` が必要
- Supabaseの `.ilike()` は大文字小文字を無視するLIKE検索。日本語も問題なく動作する
- フィルタバーは Client Component だが、一覧のデータフェッチ部分（`page.tsx`）は Server Component のままにする（`Suspense` でラップするとローディング体験も改善できる）
- `q` によるキーワード検索は `or()` で `title` と `summary` 両方を対象にする
