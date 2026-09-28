'use client'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/shared/utils'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useId } from 'react'

export interface GenerationStage {
  key: string
  label: string
}

interface GenerationProgressProps {
  badge: string
  title: string
  note?: string
  stages: GenerationStage[]
  activeStage: number
  className?: string
  dockClassName?: string
}

export default function GenerationProgress({
  badge,
  title,
  note,
  stages,
  activeStage,
  className,
  dockClassName
}: GenerationProgressProps) {
  const titleId = useId()

  const total = stages.length
  const done = Math.min(Math.max(activeStage, 0), total)
  const current = stages[Math.min(done, total - 1)]

  // Mounted only while a run is in flight, so the guard lifts itself when it lands.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()

    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  return (
    <div
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-labelledby={titleId}
      onPointerDownCapture={(event) => event.preventDefault()}
      className={cn(
        'absolute inset-0 z-30 flex cursor-progress items-center justify-center p-4 touch-none overscroll-contain duration-300 animate-in fade-in',
        className
      )}
    >
      <span
        aria-hidden='true'
        className='absolute inset-0 bg-primary/25 supports-backdrop-filter:backdrop-blur-[2px]'
      />

      <div
        className={cn(
          'relative w-full max-w-sm rounded-3xl bg-primary/90 p-4 text-white shadow-[0_1rem_2.5rem_rgb(28_43_43/35%)] ring-1 ring-white/15 duration-500 animate-in zoom-in-95 supports-backdrop-filter:bg-primary/80 supports-backdrop-filter:backdrop-blur-md sm:p-5',
          dockClassName
        )}
      >
        <div className='flex items-center gap-2'>
          <HugeiconsIcon icon={SparklesIcon} className='size-3.5 shrink-0' />
          <span className='truncate text-xs font-semibold text-white/85'>{badge}</span>

          <Spinner className='size-4 shrink-0 text-white/70' />
          <span className='ml-auto shrink-0 text-xs font-semibold tabular-nums text-white/60'>
            {Math.min(done + 1, total)}/{total}
          </span>
        </div>

        <p id={titleId} className='mt-2 line-clamp-2 text-pretty font-title text-lg font-bold leading-snug sm:text-xl'>
          {title}
        </p>

        <p className='mt-0.5 truncate text-sm text-white/75'>{current?.label}</p>

        <ol aria-hidden='true' className='mt-3 flex items-center gap-1'>
          {stages.map((item, index) => (
            <li
              key={item.key}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-500',
                index < done ? 'bg-white' : index === done ? 'animate-pulse bg-white/70' : 'bg-white/25'
              )}
            />
          ))}
        </ol>

        {note ? <p className='mt-3 text-pretty text-xs leading-relaxed text-white/60'>{note}</p> : null}
      </div>
    </div>
  )
}
