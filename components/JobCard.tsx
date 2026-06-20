import Link from 'next/link'
import type { JobPosting } from '@/types/database'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function JobCard({ job }: { job: JobPosting }) {
  const visibleTags = job.tags.slice(0, 3)
  const remainingCount = job.tags.length - visibleTags.length

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold line-clamp-2 flex-1" style={{ color: '#0F172A' }}>
          {job.title ?? 'タイトル未設定'}
        </h2>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <SourceBadge source={job.source} />
        {job.rate && (
          <span className="text-xs" style={{ color: '#64748B' }}>{job.rate}</span>
        )}
      </div>

      {job.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{ color: '#64748B', backgroundColor: '#F1F5F9' }}
            >
              {tag}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="text-xs" style={{ color: '#64748B' }}>他{remainingCount}件</span>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-3 text-xs" style={{ color: '#64748B' }}>
        <span>登録: {formatDate(job.created_at)}</span>
        <span>更新: {formatDate(job.updated_at)}</span>
      </div>
    </Link>
  )
}
