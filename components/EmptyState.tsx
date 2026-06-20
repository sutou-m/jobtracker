import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-sm" style={{ color: '#64748B' }}>登録された案件はありません</p>
      <Link
        href="/new"
        className="px-4 py-2 rounded-md text-sm font-medium text-white"
        style={{ backgroundColor: '#2563EB' }}
      >
        + 案件を登録する
      </Link>
    </div>
  )
}
