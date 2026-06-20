import { supabase } from '@/lib/supabase'
import { JobCard } from '@/components/JobCard'
import { EmptyState } from '@/components/EmptyState'

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
        <span className="text-sm" style={{ color: '#64748B' }}>
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
