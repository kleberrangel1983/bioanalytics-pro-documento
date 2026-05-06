import { cn } from '@/lib/utils'
import { SAMPLE_STATUS_CONFIG } from '@/lib/constants'
import type { SampleStatus } from '@/lib/types'

interface SampleStatusBadgeProps {
  status: SampleStatus
}

export function SampleStatusBadge({ status }: SampleStatusBadgeProps) {
  const config = SAMPLE_STATUS_CONFIG[status]
  if (!config) return null
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', config.bgColor, config.color)}>
      {config.label}
    </span>
  )
}
