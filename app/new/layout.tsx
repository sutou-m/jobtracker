import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '案件登録 | JobTracker',
}

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
