# T-11: 案件削除機能

## 前提チケット
T-08（詳細・編集画面）

## 概要
登録済み案件を削除できるようにする。一覧画面でのカード削除と、詳細・編集画面からの削除の2経路を実装する。誤削除を防ぐため確認ダイアログを表示する。

## 実装内容

### 1. 詳細・編集画面からの削除

`app/jobs/[id]/JobEditForm.tsx` に削除ボタンを追加:

- フォーム下部に「この案件を削除」ボタン（danger variant）
- クリックで `window.confirm()` を表示
- 確認後に `supabase.from('job_postings').delete().eq('id', id)` を実行
- 削除後は `/` へリダイレクト

```tsx
async function handleDelete() {
  const confirmed = window.confirm('この案件を削除しますか？この操作は元に戻せません。')
  if (!confirmed) return

  setIsDeleting(true)
  const { error } = await supabase
    .from('job_postings')
    .delete()
    .eq('id', job.id)
  setIsDeleting(false)

  if (error) {
    alert('削除に失敗しました: ' + error.message)
    return
  }
  router.push('/')
}
```

### 2. 一覧カードからの削除（オプション）

`components/JobCard.tsx` に削除ボタン（ゴミ箱アイコン）を追加:

- カードの右上にアイコンボタン
- 確認後に削除 → `router.refresh()`

### 3. 削除ボタンのスタイル

```tsx
<button
  onClick={handleDelete}
  disabled={isDeleting}
  className="px-4 py-2 rounded-md text-sm font-medium text-white"
  style={{ backgroundColor: '#EF4444' }}
>
  {isDeleting ? '削除中...' : 'この案件を削除'}
</button>
```

### 対象ファイル
- `app/jobs/[id]/JobEditForm.tsx`（削除ボタン追加）
- `components/JobCard.tsx`（削除アイコン追加、任意）

## 完了条件
- [ ] 詳細・編集画面に「この案件を削除」ボタンが表示される
- [ ] 確認ダイアログが表示され、「キャンセル」では削除されない
- [ ] 「OK」を押すと `job_postings` から該当レコードが削除される
- [ ] 削除後に一覧画面へリダイレクトされる
- [ ] 削除中はボタンが無効化される（二重実行防止）

## 注意事項
- `window.confirm()` はシンプルで十分。モーダルコンポーネントは過剰設計になるため導入しない
- 削除は **物理削除**（ソフトデリート不要）。個人用ツールで復元ニーズは低い
- RLSの `anon` ポリシーが DELETE を許可していることをT-01で確認済みであること
