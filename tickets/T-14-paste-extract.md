# T-14: テキスト貼り付けによる案件情報自動抽出（OpenAI GPT-4o）

## 前提チケット
T-07（案件登録画面）

## 概要
登録画面（/new）に、案件募集文などのテキストを貼り付けると、サーバー側のAPI Route（`/api/extract-job-text`）がOpenAI GPT-4oを呼び出してタイトル・単価・スキルタグ・サイト種別を抽出し、フォームに仮入力する機能を追加する。

---

## 実装内容

### 1. API Route `app/api/extract-job-text/route.ts`

POSTリクエストでテキストを受け取り、OpenAI Chat Completions APIへ送信して抽出結果をJSONで返す。

#### リクエスト
```ts
{ text: string }
```

#### レスポンス
```ts
{
  title: string | null
  rate: string | null
  tags: string[]        // スキル・技術キーワードのみ（例: ["React", "TypeScript"]）
  source: JobSource     // 'indeed' | 'lancers' | 'findy' | 'wantedly' | 'other'
}
```

#### OpenAIへのプロンプト（システム）

```
あなたは求人・案件情報を構造化するアシスタントです。
ユーザーから案件の本文テキストが与えられるので、以下のJSONを必ず返してください。
推測できない項目はnullまたは空配列にしてください。説明文やコードブロックは不要です。JSONのみ返してください。

{
  "title": "案件タイトル（string | null）",
  "rate": "単価・報酬の文字列（例: '月60万円'）（string | null）",
  "tags": ["スキル名", ...],
  "source": "indeed | lancers | findy | wantedly | other"
}

sourceの判定基準:
- テキスト中に「Indeed」「いんでぃーど」が含まれる → "indeed"
- 「ランサーズ」「Lancers」が含まれる → "lancers"
- 「Findy」「ファインディ」が含まれる → "findy"
- 「Wantedly」「ウォンテッドリー」が含まれる → "wantedly"
- 判断できない → "other"
```

#### 実装のポイント
- モデル: `gpt-4o`
- `response_format: { type: 'json_object' }` を指定してJSON以外の返答を防ぐ
- タイムアウト: 15秒（`AbortSignal.timeout(15000)`）
- テキストが空または500文字未満でも処理を通す（APIが適切に返す）
- テキストが3000文字を超える場合は先頭3000文字にトリムしてからAPIへ渡す（トークン節約）
- `OPENAI_API_KEY` は `.env.local` から読み込む（`process.env.OPENAI_API_KEY`）
- エラー時は `{ error: string }` を返す

#### ライブラリ
- `openai` npm パッケージを使用（`npm install openai`）

---

### 2. UIの追加 `app/new/page.tsx`

URLセクションと案件情報フォームの間に「テキストから抽出」セクションを追加する。

```
[ URLセクション（既存） ]

[ テキスト貼り付けセクション（新規） ]
  ┌─────────────────────────────────────────────┐
  │ 案件テキストを貼り付け（Textarea, rows=6）  │
  └─────────────────────────────────────────────┘
  [ AIで自動入力 ] ボタン（secondary）

[ 案件情報フォーム（既存） ]
```

- 「AIで自動入力」クリックで `/api/extract-job-text` をPOSTし、結果をフォームにマージ
- **マージ挙動**: 空欄のみ埋める（ユーザーが先に手入力した値は上書きしない）
  - `tags` は既存タグとマージして重複除去する
- **フィードバックメッセージ**:
  - 取得中: `isExtracting` フラグでボタンにローディングスピナー
  - 成功: 「タイトル・単価・3件のタグを抽出しました」（抽出できた項目を列挙）
  - 何も抽出できなかった場合: 「抽出できる情報が見つかりませんでした。手動で入力してください。」
  - エラー: 「抽出中にエラーが発生しました。手動で入力してください。」

---

### 3. 対象ファイル

- `app/api/extract-job-text/route.ts`（新規）
- `app/new/page.tsx`（既存に追記）
- `package.json`（`openai` パッケージ追加）

---

## 環境変数

`.env.local` に設定済みであること:
```
OPENAI_API_KEY=sk-...
```

---

## 完了条件

- [ ] テキストを貼り付けて「AIで自動入力」を押すと `/api/extract-job-text` が呼ばれ、結果がフォームに反映される
- [ ] 既存のフォーム入力値（空でないフィールド）は上書きされない
- [ ] タグは既存タグとマージされ重複しない
- [ ] 何も抽出できなかった場合・エラー時にメッセージが表示される
- [ ] `npm run build` でビルドエラーがない

## 注意事項

- APIキーはサーバーサイドのみで使用する（`NEXT_PUBLIC_` プレフィックスを付けない）
- 抽出はあくまで補助機能。必ずフォームを表示してユーザーに確認させること
- `response_format: { type: 'json_object' }` を使うことでJSONパースエラーを減らす
- テキストエリアの内容は送信前にtrimする
