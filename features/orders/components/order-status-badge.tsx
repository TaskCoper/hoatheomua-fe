'use client'

import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { CancelCircleIcon, CheckmarkCircle02Icon, TimeQuarterPassIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { OrderStatus, OrderStatusLabel } from '../types'

const STATUS_ICON = {
  [OrderStatus.Pending]: TimeQuarterPassIcon,
  [OrderStatus.Paid]: CheckmarkCircle02Icon,
  [OrderStatus.Cancelled]: CancelCircleIcon
} as const satisfies Record<OrderStatus, unknown>

const STATUS_TONE: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'border-warning/40 bg-warning/10 text-warning',
  [OrderStatus.Paid]: 'border-leaf/30 bg-leaf/10 text-leaf',
  [OrderStatus.Cancelled]: 'border-destructive/40 bg-destructive/10 text-destructive'
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { t } = useTranslation()

  return (
    <Badge
      variant='outline'
      className={cn(
        'gap-1 rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wider uppercase',
        STATUS_TONE[status],
        className
      )}
    >
      <HugeiconsIcon icon={STATUS_ICON[status]} strokeWidth={2} className='size-3' />
      {t(OrderStatusLabel[status])}
    </Badge>
  )
}
