import type { JobStatus } from '@/types/database'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { Badge } from './Badge'

export function StatusBadge({ status }: { status: JobStatus }) {
  const { text, bg } = STATUS_COLORS[status]
  return <Badge label={STATUS_LABELS[status]} textColor={text} bgColor={bg} />
}
