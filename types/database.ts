/**
 * Database type definitions for JobTracker (案件トラッカー)
 * Table: job_postings
 * Ticket: T-01
 */

/** Job site source identifier */
export type JobSource = 'indeed' | 'lancers' | 'findy' | 'wantedly' | 'other'

/** Job posting progress status */
export type JobStatus = 'not_applied' | 'applied' | 'interview' | 'won' | 'declined'

/** Row type for the job_postings table */
export type JobPosting = {
  id: string
  url: string
  source: JobSource
  title: string | null
  summary: string | null
  rate: string | null
  tags: string[]
  status: JobStatus
  user_id: string | null
  created_at: string
  updated_at: string
}

/** Type for INSERT operations (id, created_at, updated_at are auto-generated) */
export type JobPostingInsert = Omit<JobPosting, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

/** Type for UPDATE operations (all fields optional except id) */
export type JobPostingUpdate = Partial<Omit<JobPosting, 'id'>>
