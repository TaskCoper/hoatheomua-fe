'use client'

import { cn } from '@/shared/utils'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import type { ReactNode } from 'react'

export function CheckoutPanel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-3xl border border-border bg-card p-5 sm:p-6', className)}>{children}</section>
}

interface CheckoutSectionProps {
  icon: IconSvgElement
  title: string
  description?: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

export default function CheckoutSection({
  icon,
  title,
  description,
  action,
  className,
  contentClassName,
  children
}: CheckoutSectionProps) {
  return (
    <CheckoutPanel className={className}>
      <header className='mb-4 flex items-start justify-between gap-3 pb-1'>
        <div className='min-w-0'>
          <h2 className='flex items-center gap-2 font-title font-semibold'>
            <HugeiconsIcon icon={icon} strokeWidth={1.75} className='size-4 shrink-0 text-primary' />
            {title}
          </h2>
          {description ? <p className='text-xs text-muted-foreground'>{description}</p> : null}
        </div>
        {action}
      </header>
      <div className={cn('space-y-3', contentClassName)}>{children}</div>
    </CheckoutPanel>
  )
}
