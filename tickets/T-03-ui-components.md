# T-03: 共通UIコンポーネント

## 前提チケット
T-02（デザインシステム）

## 概要
一覧・登録・詳細画面で共通利用するUIコンポーネントを作成する。ボタン・バッジ・カード・フォーム要素を揃えることで、後続チケットでの実装を効率化する。

## 実装内容

### 作成するコンポーネント一覧

#### `components/ui/Badge.tsx`
- ステータス / サイト種別バッジ
- `STATUS_COLORS` / `SOURCE_COLORS` をインポートして色を適用
- HEXリテラルで `style` prop に渡す（className動的生成はしない）

```tsx
type BadgeProps = {
  label: string
  textColor: string
  bgColor: string
}
export function Badge({ label, textColor, bgColor }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: textColor, backgroundColor: bgColor }}
    >
      {label}
    </span>
  )
}
```

#### `components/ui/StatusBadge.tsx`
- `status: JobStatus` を受け取り、ラベルとカラーを自動解決するラッパー

#### `components/ui/SourceBadge.tsx`
- `source: JobSource` を受け取り、ラベルとカラーを自動解決するラッパー

#### `components/ui/Button.tsx`
- variant: `primary` / `secondary` / `danger` / `ghost`
- Loading state（`isLoading` prop）

```tsx
// ボタン色はHEXリテラルで直書き
const variantStyles = {
  primary:   'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
  secondary: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A]',
  danger:    'bg-[#EF4444] hover:bg-[#DC2626] text-white',
  ghost:     'bg-transparent hover:bg-[#F1F5F9] text-[#0F172A]',
}
```

#### `components/ui/Input.tsx`
- `label`, `error`, `required` プロパティ対応
- `<input>` のラッパー

#### `components/ui/Textarea.tsx`
- `label`, `rows` 対応
- `<textarea>` のラッパー

#### `components/ui/Select.tsx`
- `label`, `options: {value, label}[]` 対応

#### `components/ui/TagInput.tsx`
- `tags: string[]` / `onChange` を受け取る
- Enter or カンマで追加、×ボタンで削除
- タグをバッジ形式で表示

#### `components/ui/Card.tsx`
- 案件カード（一覧表示用）
- `JobPosting` を受け取り、タイトル・サイト種別・ステータス・更新日・単価を表示
- クリックで `/jobs/[id]` へ遷移

### 対象ファイル
- `components/ui/Badge.tsx`
- `components/ui/StatusBadge.tsx`
- `components/ui/SourceBadge.tsx`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Textarea.tsx`
- `components/ui/Select.tsx`
- `components/ui/TagInput.tsx`
- `components/ui/Card.tsx`

## 完了条件
- [ ] 全コンポーネントが TypeScript でエラーなく実装されている
- [ ] `Badge` のカラーはすべてHEXリテラルで指定されている（CSS変数参照なし）
- [ ] `Button` の全variantが視覚的に区別できる
- [ ] `TagInput` でタグの追加・削除ができる
- [ ] `npm run build` でビルドエラーがない

## 注意事項
- ボタン・バッジの色は絶対に動的クラス（`` `bg-[${color}]` ``）で生成しない。Tailwindのビルド時に未使用クラスとして除去されてスタイルが消えるため
- 代わりに `style={{ backgroundColor: '#2563EB' }}` のようにインラインスタイルを使うか、事前に定義済みのクラス文字列定数を使う
