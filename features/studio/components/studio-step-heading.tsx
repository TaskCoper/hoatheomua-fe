'use client'

import type { ReactNode } from 'react'

interface StudioStepHeadingProps {
  title: ReactNode
  description: ReactNode
  actions?: ReactNode
}

export default function StudioStepHeading({ title, description, actions }: StudioStepHeadingProps) {
  return (
    <div className='flex items-start justify-between gap-4 lg:items-center lg:gap-8'>
      <div className='min-w-0'>
        <h2 className='text-pretty font-title text-lg font-bold text-primary'>{title}</h2>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>

      {actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
    </div>
  )
}
