---
name: project-jobtracker-conventions
description: JobTracker プロジェクトのDB設計規約・確認済み決定事項（テーブル命名・認証・既存プロジェクト共存ルール）
metadata:
  type: project
---

# JobTracker DB設計 確認済み規約

**テーブル命名規則:** `job_` プレフィックス必須。既存 `kak_` / `vet_` テーブルとの衝突を避けるため。

**Why:** 既存の Supabase プロジェクトを共用している（無料プランは2プロジェクト上限）。

**How to apply:** 新しいテーブルを追加するときは常に `job_` で始める名前にする。

---

# 認証設計

**現状:** 認証なし（個人専用アプリ）。anon ロールからの全操作を許可する RLS ポリシーを設定。

**将来:** Supabase Auth 追加を見越して `user_id UUID` カラムを各テーブルに用意（NULL許容）。

**How to apply:** RLS ポリシーを作成する際は anon 許可ポリシーを本番とし、Auth 追加時用の `authenticated` ポリシーテンプレートをコメントアウトで残す。

---

# Supabaseクライアント

- パッケージ: `@supabase/supabase-js` v2（2.108.2 確認済み）
- Prisma は使用しない（IPv4環境でTCP直接接続不可のため）
- クライアントファイル: `lib/supabase.ts`

---

# マイグレーション

- ファイル配置: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- 実行方法: Supabase SQL Editor から手動実行（Claude Code CLI経由は日本語文字化けリスクあり）
- SQL は UTF-8 で保存する

---

# 環境変数

- `.env.local` は実値が設定済み（Supabase URL・Anon Key・Service Key 全て設定あり）
- テンプレートは `.env.local.example` として管理
