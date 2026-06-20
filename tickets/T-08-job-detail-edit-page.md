# T-08: 案件詳細・編集画面（/jobs/[id]）

## 前提チケット
T-01（DBスキーマ）、T-03（UIコンポーネント）、T-04（レイアウト）、T-07（登録画面）

## 概要
登録済み案件の詳細表示と編集を行う画面を実装する。一覧から遷移し、全項目を確認・修正できる。フォームUIはT-07の登録画面と共通化できる部分は切り出す。削除機能はT-11で追加する。

## 実装内容

### 1. `app/jobs/[id]/page.tsx` — 構成

Server Componentで案件データを取得し、Client ComponentのフォームにPropsとして渡す。

```tsx
// Server Component部分
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { JobEditForm } from './JobEditForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params

  const { data: job, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    notFound()
  }

  return (
    <div>
      <JobEditForm job={job} />
    </div>
  )
}
```

### 2. `app/jobs/[id]/JobEditForm.tsx` — Client Component

- T-07の登録フォームと同じフィールド構成
- 初期値にSupabaseから取得した `job` のデータをセット
- 「更新する」ボタンで `supabase.from('job_postings').update()` を実行
- URLフィールドは変更可能（再取得ボタンも付ける）
- 更新後は一覧画面（`/`）へリダイレクト

```tsx
// 更新処理
async function handleUpdate(e: React.FormEvent) {
  e.preventDefault()
  setIsSaving(true)
  const { error } = await supabase
    .from('job_postings')
    .update({ url, ...form })
    .eq('id', job.id)
  setIsSaving(false)
  if (error) {
    alert('更新に失敗しました: ' + error.message)
    return
  }
  router.push('/')
}
```

### 3. フォームコンポーネントの共通化（任意）
- T-07とフォームUIが重複する場合、`components/JobForm.tsx` として切り出してもよい
- ただし無理に共通化せず、まず動くものを作ることを優先する

### 4. ページ上部の情報表示
- 案件URL（クリックで外部リンクを新タブで開く）
- 登録日・更新日
- 現在のステータスバッジ

### 5. ナビゲーション
- ページ左上に「← 一覧へ戻る」リンク

### 対象ファイル
- `app/jobs/[id]/page.tsx`
- `app/jobs/[id]/JobEditForm.tsx`

## 完了条件
- [ ] 一覧から案件カードをクリックすると `/jobs/[id]` に遷移し、詳細が表示される
- [ ] 全フィールドが編集可能で、「更新する」を押すとSupabaseのデータが更新される
- [ ] 更新後に一覧画面へリダイレクトされる
- [ ] 存在しない `id` にアクセスすると404ページが表示される
- [ ] URL横の外部リンクアイコンをクリックすると、新タブで案件サイトが開く
- [ ] `updated_at` がトリガーによって自動更新される（T-01のトリガー確認）

## 注意事項
- Next.js 15以降では `params` が非同期（`Promise<{ id: string }>`）のため、`await params` が必要
- `notFound()` を使うと Next.js の404ページが自動表示される
- URLフィールドを編集して再取得ボタンを押した場合も、T-06のAPIを呼び出すだけでよい（T-07と同じロジック）
- Supabase の `.update().eq('id', ...)` は RLS の `authenticated` ポリシーではなく、今回は `anon` ポリシーで許可されているため、認証トークン不要
