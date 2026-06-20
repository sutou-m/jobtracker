import type { JobSource, JobStatus } from '@/types/database'

export const SOURCE_LABELS: Record<JobSource, string> = {
  indeed: 'Indeed',
  lancers: 'ランサーズ',
  findy: 'Findy',
  wantedly: 'Wantedly',
  other: 'その他',
}

export const STATUS_LABELS: Record<JobStatus, string> = {
  not_applied: '未応募',
  applied: '応募済',
  interview: '面談',
  won: '受注',
  declined: '見送り',
}

export const STATUS_COLORS: Record<JobStatus, { text: string; bg: string }> = {
  not_applied: { text: '#64748B', bg: '#F1F5F9' },
  applied:     { text: '#2563EB', bg: '#EFF6FF' },
  interview:   { text: '#D97706', bg: '#FFFBEB' },
  won:         { text: '#059669', bg: '#ECFDF5' },
  declined:    { text: '#DC2626', bg: '#FEF2F2' },
}

export const SOURCE_COLORS: Record<JobSource, { text: string; bg: string }> = {
  indeed:   { text: '#2557A7', bg: '#EBF3FF' },
  lancers:  { text: '#C9561E', bg: '#FFF3EE' },
  findy:    { text: '#0F7B6C', bg: '#E6F7F5' },
  wantedly: { text: '#00A4C4', bg: '#E5F7FA' },
  other:    { text: '#64748B', bg: '#F1F5F9' },
}
