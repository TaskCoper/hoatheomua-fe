'use client'

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { type ReactNode } from 'react'

export function AccountEmptyState({
  icon,
  title,
  description,
  action
}: {
  icon: IconSvgElement
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className='flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'>
      <span className='bob-tilt-sm grid size-20 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
        <HugeiconsIcon icon={icon} className='size-9' strokeWidth={1.5} />
      </span>
      <h3 className='font-title text-xl font-bold text-primary sm:text-2xl'>{title}</h3>
      <p className='max-w-md text-sm leading-relaxed text-muted-foreground'>{description}</p>
      {action}
    </div>
  )
}

export function AccountEmptyNote({ icon, children }: { icon: IconSvgElement; children: ReactNode }) {
  return (
    <div className='flex flex-col items-center gap-2 rounded-3xl bg-card px-6 py-10 text-center shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'>
      <span className='grid size-12 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
        <HugeiconsIcon icon={icon} className='size-5' strokeWidth={1.5} />
      </span>
      <p className='text-sm text-muted-foreground'>{children}</p>
    </div>
  )
}
