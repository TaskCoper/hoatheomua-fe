'use client'

import type { ReactNode } from 'react'

interface StudioStepHeadingProps {
  title: ReactNode
  description: ReactNode
  actions?: ReactNode
}

export default function StudioStepHeading({ title, description, actions }: StudioStepHeadingProps) {
  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8'>
      <div className='min-w-0'>
        <h2 className='text-pretty font-title text-lg font-bold text-primary'>{title}</h2>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>

      {actions ? <div className='hidden shrink-0 flex-wrap items-center gap-3 lg:flex'>{actions}</div> : null}
    </div>
  )
}
