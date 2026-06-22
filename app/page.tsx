import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { JobCard } from '@/components/JobCard'
import { EmptyState } from '@/components/EmptyState'
import { FilterBar } from '@/components/FilterBar'

type SearchParams = {
  status?: string
  source?: string
  q?: string
  sort?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status, source, q, sort } = await searchParams

  let query = supabase.from('job_postings').select('*')

  if (status) query = query.eq('status', status)
  if (source) query = query.eq('source', source)
  if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)

  const sortColumn = sort === 'updated_at' ? 'updated_at' : 'created_at'
  query = query.order(sortColumn, { ascending: false })

  const { data: jobs, error } = await query

  if (error) {
    return <p style={{ color: '#DC2626' }}>データの取得に失敗しました</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
          案件一覧
        </h1>
        <span className="text-sm" style={{ color: '#64748B' }}>
          {jobs.length} 件
        </span>
      </div>
      <Suspense>
        <FilterBar />
      </Suspense>
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
