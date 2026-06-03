import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils'
import { CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type * as React from 'react'

interface DataTableFilterTriggerProps extends React.ComponentProps<typeof Button> {
  clearLabel: string
  emptyIcon: React.ReactNode
  hasValue: boolean
  onClear: (event: React.MouseEvent<HTMLDivElement>) => void
}

export function DataTableFilterTrigger({
  children,
  className,
  clearLabel,
  emptyIcon,
  hasValue,
  onClear,
  ...props
}: DataTableFilterTriggerProps) {
  return (
    <Button variant='outline' size='sm' className={cn('border-dashed font-normal', className)} {...props}>
      {hasValue ? (
        <div
          role='button'
          aria-label={clearLabel}
          tabIndex={0}
          className='rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          onClick={onClear}
        >
          <HugeiconsIcon icon={CancelCircleIcon} />
        </div>
      ) : (
        emptyIcon
      )}
      {children}
    </Button>
  )
}
