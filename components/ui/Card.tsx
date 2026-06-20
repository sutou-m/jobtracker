import Link from 'next/link'
import type { JobPosting } from '@/types/database'
import { StatusBadge } from './StatusBadge'
import { SourceBadge } from './SourceBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function Card({ job }: { job: JobPosting }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold line-clamp-2 flex-1" style={{ color: '#0F172A' }}>
          {job.title ?? '（タイトルなし）'}
        </h3>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <SourceBadge source={job.source} />
        {job.rate && (
          <span className="text-xs" style={{ color: '#64748B' }}>{job.rate}</span>
        )}
      </div>

      <p className="mt-2 text-xs" style={{ color: '#64748B' }}>
        更新: {formatDate(job.updated_at)}
      </p>
    </Link>
  )
}
