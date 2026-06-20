# T-05: 案件一覧画面（/）

## 前提チケット
T-01（DBスキーマ）、T-03（UIコンポーネント）、T-04（レイアウト）

## 概要
アプリのトップページとなる案件一覧画面を実装する。Supabaseから全案件を取得してカード形式で表示し、ステータスやサイト種別が一目でわかるバッジを付ける。検索・フィルタ機能はT-09で追加するため、このチケットでは純粋な一覧表示に集中する。

## 実装内容

### 1. `app/page.tsx` — Server Component

```tsx
import { supabase } from '@/lib/supabase'
import { JobPosting } from '@/types/database'
import { JobCard } from '@/components/JobCard'

export default async function HomePage() {
  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p style={{ color: '#DC2626' }}>データの取得に失敗しました</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
          案件一覧
        </h1>
        <span style={{ color: '#64748B' }} className="text-sm">
          {jobs.length} 件
        </span>
      </div>
      {jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2. `components/JobCard.tsx`
- T-03の `Card` コンポーネントを使う、または独立実装
- 表示項目:
  - タイトル（未入力なら「タイトル未設定」）
  - サイト種別バッジ（SourceBadge）
  - ステータスバッジ（StatusBadge）
  - 想定単価（あれば）
  - タグ（最大3件 + 「他N件」）
  - 登録日・更新日
- カード全体がリンクになっており `/jobs/[id]` へ遷移

### 3. `components/EmptyState.tsx`
- 案件が0件の場合の表示
- 「+ 案件を登録する」ボタンを配置

### 対象ファイル
- `app/page.tsx`
- `components/JobCard.tsx`
- `components/EmptyState.tsx`

## 完了条件
- [ ] `/` にアクセスすると案件一覧が表示される
- [ ] Supabaseの `job_postings` テーブルに登録された案件がカードで表示される
- [ ] 各カードにステータスバッジ・サイト種別バッジが表示される
- [ ] 案件0件のときに EmptyState が表示される
- [ ] 各カードをクリックすると `/jobs/[id]` へ遷移する
- [ ] 新着順（created_at DESC）で並んでいる

## 注意事項
- このページはServer Componentのままにする（`'use client'` 不要）。フィルタ・検索はT-09で追加するが、その際もURL SearchParamsベースの実装にすることでSSRを維持できる
- 日付の表示は `toLocaleDateString('ja-JP')` を使う
- タイトルが `null` の場合の表示崩れに注意（フォールバックテキストを用意する）
