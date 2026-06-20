import Link from 'next/link'

export function Header() {
  return (
    <header
      className="border-b px-4 py-3"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
          style={{ color: '#0F172A' }}
        >
          JobTracker
        </Link>
        <Link
          href="/new"
          className="px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: '#2563EB' }}
        >
          + 案件を登録
        </Link>
      </div>
    </header>
  )
}
