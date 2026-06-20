## Supabase MCP 接続設定（2026年6月時点の正しい手順）

新規プロジェクトでSupabase MCPを使う際、**過去（Kakeru/Vettly時点）の設定方法はSupabase側の仕様変更により使えなくなっている**。新規プロジェクトでは必ず以下の新方式で設定すること。

### 起きていたトラブルの経緯（記録）

- 旧方式：`claude mcp add supabase --transport sse https://mcp.supabase.com/sse --header "Authorization: Bearer <Personal Access Token>"`
- この旧URL（`/sse`）は廃止されており、アクセスすると `404 Not Found` になる
- `claude mcp list` で `supabase: ... Failed to connect` と出たら、まずこの旧URL問題を疑うこと
- Claude Code自身に「MCP設定がない」と何度も言われても、実際はファイルに設定はあり、接続だけが失敗していることがある。`claude mcp list` で事実を確認するのが一番早い

### 正しい設定手順（新規プロジェクトごとに毎回必要）

1. **Supabase管理画面で project_ref を確認**
   - 対象プロジェクト → Settings → General → 「Project ID」をコピー

2. **ターミナルでMCPサーバーを登録**（プロジェクトのルートディレクトリで実行）
   ```powershell
   claude mcp add supabase --transport http "https://mcp.supabase.com/mcp?project_ref=<project-ref>"
   ```
   - Personal Access Tokenは**もう不要**（古い情報には書かれているが無視してよい）
   - 既に登録済みでエラーが出る場合は、先に `claude mcp remove supabase` してから再登録する

3. **Claude Codeを起動し、Supabase関連の操作を依頼する**
   ```powershell
   claude --dangerously-skip-permissions
   ```
   - 初回はOAuth認証が必要。Claude Codeが認証用URLを提示するので、ブラウザでそれを開く
   - Supabaseアカウントでログインし、組織・プロジェクトへのアクセスを許可
   - 「Authentication successful」が出たらブラウザタブを閉じてClaude Codeに戻る

4. **動作確認**
   ```
   Supabase MCPのツールが使えるか確認してください
   ```
   - `list_tables` 等が正常に返ってくればOK

### 注意点

- 古いプロジェクト（Kakeru/Vettly/ServiceHub）の `.claude.json` に残っている旧SSE設定はもう動かない。それらのプロジェクトで久々にMCPを使う際も、上記の新方式で設定し直す必要がある
- `~/.claude.json`（ホーム直下、`.claude`フォルダの中ではない）にプロジェクトパスごとのMCP設定が保存されている。Claude Code自身がこのファイルの場所を見失って「設定がありません」と誤った報告をすることがあるので、信用せず `claude mcp list` で確認すること
