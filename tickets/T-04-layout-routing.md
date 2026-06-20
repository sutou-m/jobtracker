# T-04: レイアウト・ルーティング基盤

## 前提チケット
T-02（デザインシステム）、T-03（共通UIコンポーネント）

## 概要
App Routerのルート構成・ナビゲーション・ルートレイアウトを整備する。本アプリは認証なし（個人専用URL運用）のため、認証によるルートグループ分割は不要。シンプルな3画面構成を用意する。

## 実装内容

### 1. ルート構成

```
app/
├── layout.tsx          # ルートレイアウト（ヘッダー含む）
├── page.tsx            # 一覧画面（/）※ T-05 で実装
├── new/
│   └── page.tsx        # 案件登録画面（/new）※ T-07 で実装
└── jobs/
    └── [id]/
        └── page.tsx    # 詳細・編集画面（/jobs/[id]）※ T-08 で実装
```

### 2. `app/layout.tsx`
- `<html lang="ja">` で日本語設定
- `<Header />` コンポーネントを配置
- `background-color: #F8FAFC` のボディ背景

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ backgroundColor: '#F8FAFC', color: '#0F172A' }}>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### 3. `components/Header.tsx`
- アプリ名「JobTracker」（ロゴ/テキスト）
- 「+ 案件を登録」ボタン → `/new` へリンク
- シンプルな上部ナビゲーション

```tsx
// ヘッダーの登録ボタン例
<Link
  href="/new"
  className="px-4 py-2 rounded-md text-sm font-medium text-white"
  style={{ backgroundColor: '#2563EB' }}
>
  + 案件を登録
</Link>
```

### 4. プレースホルダーページ作成
後続チケットで実装するページの骨格（`<h1>` とコメントのみ）を事前に作成しておく:
- `app/page.tsx` → 「一覧画面（T-05で実装）」
- `app/new/page.tsx` → 「登録画面（T-07で実装）」
- `app/jobs/[id]/page.tsx` → 「詳細・編集画面（T-08で実装）」

### 5. `next.config.ts` 設定
- `images.domains` や Server Actions のボディサイズ上限が必要な場合に備えて設定ファイルを確認する

### 対象ファイル
- `app/layout.tsx`
- `app/globals.css`（import確認）
- `components/Header.tsx`
- `app/page.tsx`（骨格）
- `app/new/page.tsx`（骨格）
- `app/jobs/[id]/page.tsx`（骨格）
- `next.config.ts`

## 完了条件
- [ ] `npm run dev` でアプリが起動する
- [ ] `/`、`/new`、`/jobs/dummy` に404なくアクセスできる
- [ ] ヘッダーが全ページで表示される
- [ ] 「+ 案件を登録」ボタンが `/new` へ遷移する
- [ ] モバイル幅でもヘッダーが崩れない

## 注意事項
- Next.js 16では `middleware.ts` が `proxy.ts` にリネームされている。認証は不要だが、将来ミドルウェアを追加する際は `proxy.ts` で作成する
- `app/jobs/[id]/page.tsx` はダイナミックルートのため、`params` の型は `Promise<{ id: string }>` となる（Next.js 15以降でparamsが非同期化されているため `await params` が必要）
- `use client` は本当に必要な箇所（フォーム・インタラクション）のみに限定し、一覧・詳細はServer Componentのままにする
