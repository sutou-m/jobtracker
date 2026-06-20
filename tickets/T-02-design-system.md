# T-02: デザインシステム・Tailwind v4設定

## 前提チケット
なし

## 概要
アプリ全体のカラートークン・タイポグラフィをTailwind CSS v4の `@theme inline` で定義する。過去案件（Kakeru/Vettly）と同様に、CSS変数ではなくHEXリテラルを使う方針を徹底する。本アプリは求人・案件管理ツールのため、落ち着いたネイビー×ホワイト系のプロフェッショナルな配色を採用する。

## 実装内容

### 1. カラーパレット定義
- Primary: `#2563EB`（ブルー）
- Primary Dark: `#1D4ED8`
- Background: `#F8FAFC`（ライトグレー）
- Surface: `#FFFFFF`
- Text Primary: `#0F172A`（スレート900）
- Text Muted: `#64748B`（スレート500）
- Border: `#E2E8F0`
- Status カラー（バッジ用）:
  - not_applied: `#94A3B8` / bg `#F1F5F9`
  - applied: `#3B82F6` / bg `#EFF6FF`
  - interview: `#F59E0B` / bg `#FFFBEB`
  - won: `#10B981` / bg `#ECFDF5`
  - declined: `#EF4444` / bg `#FEF2F2`

### 2. `app/globals.css` 更新

```css
@import "tailwindcss";

@theme inline {
  --color-primary: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #0F172A;
  --color-muted: #64748B;
  --color-border: #E2E8F0;
}

body {
  background-color: #F8FAFC;
  color: #0F172A;
  font-family: 'Noto Sans JP', system-ui, sans-serif;
}
```

### 3. サイト種別バッジカラー定数
- `lib/constants.ts` に定数を定義

```ts
export const SOURCE_LABELS: Record<string, string> = {
  indeed: 'Indeed',
  lancers: 'ランサーズ',
  findy: 'Findy',
  wantedly: 'Wantedly',
  other: 'その他',
}

export const STATUS_LABELS: Record<string, string> = {
  not_applied: '未応募',
  applied: '応募済',
  interview: '面談',
  won: '受注',
  declined: '見送り',
}

export const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  not_applied: { text: '#64748B', bg: '#F1F5F9' },
  applied:     { text: '#2563EB', bg: '#EFF6FF' },
  interview:   { text: '#D97706', bg: '#FFFBEB' },
  won:         { text: '#059669', bg: '#ECFDF5' },
  declined:    { text: '#DC2626', bg: '#FEF2F2' },
}

export const SOURCE_COLORS: Record<string, { text: string; bg: string }> = {
  indeed:    { text: '#2557A7', bg: '#EBF3FF' },
  lancers:   { text: '#C9561E', bg: '#FFF3EE' },
  findy:     { text: '#0F7B6C', bg: '#E6F7F5' },
  wantedly:  { text: '#00A4C4', bg: '#E5F7FA' },
  other:     { text: '#64748B', bg: '#F1F5F9' },
}
```

### 4. 対象ファイル
- `app/globals.css`
- `lib/constants.ts`（新規作成）

## 完了条件
- [ ] `app/globals.css` に `@theme inline` でカラートークンが定義されている
- [ ] `tailwind.config.ts` が存在しないことを確認（v4では不要）
- [ ] `lib/constants.ts` にステータス・サイト種別のラベル/カラー定数が定義されている
- [ ] `npm run dev` でスタイルが正常に反映される

## 注意事項
- **`tailwind.config.ts` は作らない**。Tailwind v4 では設定ファイル不要
- **Tailwindの組み込み `gray-*` クラスは使用禁止**。カスタムカラーを `@theme inline` で定義して使う
- ボタンの `background-color` はCSS変数（`var(--color-primary)`）ではなく、**HEXリテラルで直書き**する
  - 理由：過去案件でCSS変数が解決されずボタンテキストが不可視になる事例があった
  - 例：`className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"`
- ミュートテキストも同様にHEX直書き：`style={{ color: '#64748B' }}`
