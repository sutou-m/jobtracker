import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { JobEditForm } from './JobEditForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params

  const { data: job, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    notFound()
  }

  return (
    <div>
      <JobEditForm job={job} />
    </div>
  )
}
