import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '案件詳細 | JobTracker',
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
