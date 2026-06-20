# T-13: Vercelデプロイ・本番確認

## 前提チケット
T-01〜T-12 すべて

## 概要
アプリをVercelにデプロイして本番環境で動作確認する。Supabase環境変数の設定、ビルドエラーの解消、本番URLでの最終確認を行う。

## 実装内容

### 1. 事前確認: ビルドチェック

```bash
npm run build
npm run lint
```

ビルドエラーがあれば本チケット前に修正する。

### 2. GitHubリポジトリへのプッシュ

```bash
git add .
git commit -m "Initial implementation"
git push origin main
```

### 3. Vercelプロジェクト作成

1. [vercel.com](https://vercel.com) にアクセス
2. 「Add New Project」→ GitHubリポジトリ `sutou-m/jobtracker` を選択
3. Framework Preset: **Next.js** を確認
4. 「Environment Variables」に以下を設定:
   ```
   NEXT_PUBLIC_SUPABASE_URL=（本番のSupabase URL）
   NEXT_PUBLIC_SUPABASE_ANON_KEY=（本番のanon key）
   SUPABASE_SERVICE_KEY=（本番のservice key）
   ```
5. 「Deploy」ボタンを押す

### 4. 本番URL確認事項

デプロイ後、発行されたURLで以下を確認:

- [ ] トップページ（`/`）が表示される
- [ ] 案件登録（`/new`）でURLを入力し、自動取得が動作する
- [ ] 登録した案件が一覧に表示される
- [ ] ステータス変更が反映される
- [ ] フィルタ・検索が動作する
- [ ] 詳細・編集画面で更新・削除ができる
- [ ] スマホからアクセスしてレイアウトが崩れない

### 5. `next.config.ts` の本番設定確認

```ts
const nextConfig = {
  // 必要に応じて設定
}
```

### 6. URL共有と運用方針
- 本アプリは認証なしの個人専用ツール
- VercelのデフォルトURLはランダムなサブドメインのため、第三者に推測されにくい
- URLは自分専用のブックマークとして管理する（他者に共有しない）

### 対象ファイル
- `next.config.ts`（最終確認）
- `.env.local`（ローカル確認用）
- Vercel管理画面での環境変数設定（UI操作）

## 完了条件
- [ ] `npm run build` がエラーなく完了する
- [ ] `npm run lint` が警告・エラーなし（またはすべて解消済み）
- [ ] Vercelへのデプロイが成功する
- [ ] 本番URLで全機能が動作する
- [ ] Supabaseの本番データが正常に読み書きできる

## 注意事項
- **Vercel環境変数に `SUPABASE_SERVICE_KEY` を設定する際は「Sensitive」扱い**にする（Vercel UIで目隠し設定可能）
- ローカルの `.env.local` は `.gitignore` に含まれていることを確認（Supabaseキーを絶対にコミットしない）
- 本番ビルドで初めて発覚するエラー（型エラー・未使用import等）は `npm run build` でローカルでも発覚するため、デプロイ前に必ずビルドを通す
- `NEXT_PUBLIC_` プレフィックスがついている変数（URL・anon key）はクライアントサイドに露出する。これはSupabaseの設計上問題ない（RLSで保護されているため）
- `SUPABASE_SERVICE_KEY` には `NEXT_PUBLIC_` をつけない（サーバーサイドのみで使用）
