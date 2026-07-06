import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { JobEditForm } from './JobEditForm'
import { AiAssistSection } from './AiAssistSection'

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
    <div className="flex flex-col gap-6">
      <JobEditForm job={job} />
      <AiAssistSection
        jobInfo={{
          title: job.title,
          rate: job.rate,
          tags: job.tags,
          summary: job.summary,
          raw_text: job.raw_text,
          source: job.source,
          url: job.url,
        }}
      />
    </div>
  )
}
