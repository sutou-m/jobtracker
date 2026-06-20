# T-01: DBスキーマ・Supabaseテーブル作成

## 前提チケット
なし

## 概要
アプリの基盤となる `job_postings` テーブルをSupabaseに作成する。既存プロジェクトのテーブル（`kak_` / `vet_`）を汚さないよう `job_` プレフィックスを使用する。認証なし設計だが、将来のAuth追加に備えて `user_id` カラムを最初から設けておく。

## 実装内容

### 1. Supabase SQL Editorでテーブル作成

```sql
create table job_postings (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  source text not null default 'other',
    -- 'indeed' | 'lancers' | 'findy' | 'wantedly' | 'other'
  title text,
  summary text,
  rate text,
  tags text[] default '{}',
  status text not null default 'not_applied',
    -- 'not_applied' | 'applied' | 'interview' | 'won' | 'declined'
  user_id uuid, -- NULL許容・将来のAuth追加用
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2. updated_at 自動更新トリガー

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger job_postings_updated_at
  before update on job_postings
  for each row execute function update_updated_at();
```

### 3. RLSポリシー設定

```sql
-- RLS有効化
alter table job_postings enable row level security;

-- anon（未認証）からの全操作を許可（個人専用・認証なしのため）
create policy "allow_all_for_anon" on job_postings
  for all to anon using (true) with check (true);
```

### 4. 型定義ファイル作成
- `types/database.ts` に TypeScript 型を追加

```ts
export type JobSource = 'indeed' | 'lancers' | 'findy' | 'wantedly' | 'other'
export type JobStatus = 'not_applied' | 'applied' | 'interview' | 'won' | 'declined'

export type JobPosting = {
  id: string
  url: string
  source: JobSource
  title: string | null
  summary: string | null
  rate: string | null
  tags: string[]
  status: JobStatus
  user_id: string | null
  created_at: string
  updated_at: string
}
```

### 5. Supabaseクライアント設定
- `lib/supabase.ts` を作成（`@supabase/supabase-js` 使用）

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

- `.env.local` に以下を設定（実際の値はSupabase管理画面 → Connect → App Frameworks から取得）:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  ```

## 完了条件
- [ ] `job_postings` テーブルがSupabase上に存在する
- [ ] `updated_at` 自動更新トリガーが動作する
- [ ] RLSポリシーが設定されており、anon からの SELECT/INSERT/UPDATE/DELETE が通る
- [ ] `types/database.ts` に `JobPosting` / `JobSource` / `JobStatus` 型が定義されている
- [ ] `lib/supabase.ts` が作成されている
- [ ] `.env.local` に接続情報が設定されている

## 注意事項
- **Prismaは使用しない**。IPv4環境ではSupabaseへのTCP直接接続ができないため、`@supabase/supabase-js` のみ使用する
- テーブル作成・RLS設定は必ずSupabase管理画面のSQL Editorで実行する（Claude Code CLI経由だと日本語が文字化けする場合あり）
- 既存の `kak_` / `vet_` テーブルとの衝突を防ぐため、テーブル名は必ず `job_` で始める
- Supabaseプロジェクトは既存のものを使用（無料プランは2プロジェクト上限のため新規作成しない）
- Region: `Northeast Asia (Tokyo)` であることを確認する
