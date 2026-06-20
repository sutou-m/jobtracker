import type { JobSource } from '@/types/database'
import { SOURCE_LABELS, SOURCE_COLORS } from '@/lib/constants'
import { Badge } from './Badge'

export function SourceBadge({ source }: { source: JobSource }) {
  const { text, bg } = SOURCE_COLORS[source]
  return <Badge label={SOURCE_LABELS[source]} textColor={text} bgColor={bg} />
}
