# T-10: ステータスクイック更新

## 前提チケット
T-05（案件一覧）、T-08（詳細・編集画面）

## 概要
一覧画面から詳細画面に遷移せずにステータスを即座に変更できる「クイック更新」機能を追加する。応募済に変更→面談に変更、といった頻繁なステータス更新を1クリックで完了できるようにする。

## 実装内容

### 1. 一覧カードへのステータス変更ドロップダウン追加

`components/JobCard.tsx` にステータス変更ドロップダウンを追加:

- ステータスバッジをクリックするとドロップダウンが開く
- 各ステータスをクリックすると即座にSupabaseを更新
- 更新後は一覧をリフレッシュ（`router.refresh()`）

```tsx
'use client'

async function handleStatusChange(newStatus: JobStatus) {
  const { error } = await supabase
    .from('job_postings')
    .update({ status: newStatus })
    .eq('id', job.id)
  
  if (!error) {
    router.refresh() // Server Componentを再フェッチ
  }
}
```

### 2. `components/StatusDropdown.tsx` — Client Component

```tsx
type Props = {
  jobId: string
  currentStatus: JobStatus
}

export function StatusDropdown({ jobId, currentStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const statuses: JobStatus[] = [
    'not_applied', 'applied', 'interview', 'won', 'declined'
  ]

  async function handleSelect(status: JobStatus) {
    setIsUpdating(true)
    setIsOpen(false)
    await supabase
      .from('job_postings')
      .update({ status })
      .eq('id', jobId)
    setIsUpdating(false)
    router.refresh()
  }

  return (
    <div className="relative">
      {/* 現在のステータスバッジ（クリックでドロップダウン開閉） */}
      <button onClick={() => setIsOpen(!isOpen)}>
        <StatusBadge status={currentStatus} />
        {isUpdating && <span>…</span>}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 rounded-md shadow-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
          {statuses.map((s) => (
            <button key={s} onClick={() => handleSelect(s)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-[#F1F5F9]">
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 3. ドロップダウンの閉じ処理
- ドロップダウン外クリックで閉じる（`useEffect` + `document.addEventListener`）

### 対象ファイル
- `components/StatusDropdown.tsx`（新規作成）
- `components/JobCard.tsx`（StatusDropdown を組み込む）

## 完了条件
- [ ] 一覧カードのステータスバッジをクリックするとドロップダウンが開く
- [ ] ステータスを選択すると即座にSupabaseが更新される
- [ ] 更新後に一覧が自動リフレッシュされ、バッジの色が変わる
- [ ] ドロップダウン外をクリックすると閉じる
- [ ] 更新中はローディング表示がある

## 注意事項
- `router.refresh()` は Next.js App Router のServer Componentを再フェッチさせる仕組み。Stateはリセットされないが、サーバーデータは最新になる
- ドロップダウンの `position: absolute` が他のカードに隠れないよう、`z-index` を適切に設定する（`z-10` 以上）
- `isOpen` の管理は各カードが独立して持つため、複数カードで同時に開くことはないが、`setIsOpen(false)` の呼び忘れに注意
