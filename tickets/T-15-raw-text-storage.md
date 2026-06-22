# T-15: 生テキスト（raw_text）のDB保存

## 前提チケット
T-14（テキスト貼り付けによる案件情報自動抽出）

## 概要
案件登録時にユーザーが「テキスト貼り付け→AI抽出」した際の元テキスト（raw_text）を `job_postings` テーブルに保存する。これにより、T-16のAIアシスト機能が詳細画面で元テキストを活用できるようになる。

---

## 実装内容

### 1. DBマイグレーション（Supabase MCP経由）

`job_postings` テーブルに `raw_text` カラムを追加する:

```sql
ALTER TABLE job_postings
ADD COLUMN raw_text text;
```

- 型: `text`（NULL許容）
- 既存レコードには `NULL` が入る（既存データへの影響なし）
- Supabase MCP の `apply_migration` ツールで実行する

### 2. 型定義の更新 `types/database.ts`

```ts
export type JobPosting = {
  // ... 既存フィールド ...
  raw_text: string | null  // 追加
}

export type JobPostingInsert = Omit<JobPosting, 'id' | 'created_at' | 'updated_at'> & {
  // ...
}
// JobPostingUpdate は Partial<Omit<JobPosting, 'id'>> のため自動的に raw_text が含まれる
```

### 3. 登録画面の更新 `app/new/page.tsx`

`handleSubmit` 関数内で INSERT する際に `raw_text` を含める:

```ts
// 現在
const { error } = await supabase.from('job_postings').insert({ url, ...form })

// 変更後
const { error } = await supabase.from('job_postings').insert({
  url,
  ...form,
  raw_text: pasteText.trim() || null,
})
```

- `pasteText` は既に state として存在している（T-14 で実装済み）
- 空文字の場合は `null` として保存する

### 対象ファイル
- DBマイグレーション（Supabase MCP経由）
- `types/database.ts`（`raw_text` フィールド追加）
- `app/new/page.tsx`（INSERT時に `raw_text` を含める）

---

## 完了条件
- [ ] `job_postings` テーブルに `raw_text text` カラムが追加されている
- [ ] `/new` でテキストを貼り付けてAI抽出→登録すると `raw_text` にテキストが保存される
- [ ] テキスト未入力で登録した場合、`raw_text` は `NULL` になる
- [ ] `npm run build` でビルドエラーがない

## 注意事項
- `raw_text` は長文になる可能性があるため、Supabase の `text` 型（上限なし）を使う
- 登録画面で `pasteText` は既存の state を流用するだけ。新しい UI 追加は不要
- 詳細・編集画面（JobEditForm）からの UPDATE 時は `raw_text` を上書きしない（`handleUpdate` の update オブジェクトに含めない）
