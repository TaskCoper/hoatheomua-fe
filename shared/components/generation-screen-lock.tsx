'use client'

import { Spinner } from '@/components/ui/spinner'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/shared/utils'
import { SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface GenerationStage {
  key: string
  label: string
}

interface GenerationScreenLockProps {
  badge: string
  title: string
  note?: string
  stages: GenerationStage[]
  activeStage: number
}

export default function GenerationScreenLock({ badge, title, note, stages, activeStage }: GenerationScreenLockProps) {
  const hasMounted = useHasMounted()
  const titleId = useId()
  const surface = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMounted) return

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    surface.current?.focus()

    const keepFocus = (event: FocusEvent) => {
      const layer = surface.current
      if (!layer || layer.contains(event.target as Node)) return

      event.stopPropagation()
      layer.focus()
    }

    document.addEventListener('focusin', keepFocus, true)

    return () => {
      body.style.overflow = previousOverflow
      document.removeEventListener('focusin', keepFocus, true)
    }
  }, [hasMounted])

  if (!hasMounted) return null

  return createPortal(
    <div
      ref={surface}
      data-slot='generation-screen-lock'
      className='pointer-events-auto fixed inset-0 z-60 flex touch-none items-center justify-center overscroll-contain bg-primary/95 p-6 text-white supports-backdrop-filter:backdrop-blur-sm'
      role='alertdialog'
      aria-modal='true'
      aria-busy='true'
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className='w-full max-w-md' aria-live='polite' aria-atomic='true'>
        <div className='flex items-center gap-2.5'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25'>
            <HugeiconsIcon icon={SparklesIcon} className='size-3' />
            {badge}
          </span>
          <Spinner className='size-4 text-white/80' />
        </div>

        <p id={titleId} className='mt-5 text-pretty font-title text-2xl font-bold leading-tight sm:text-3xl'>
          {title}
        </p>

        {note ? <p className='mt-2 text-pretty text-sm text-white/75'>{note}</p> : null}

        <ol className='mt-6 space-y-3 border-t border-white/25 pt-5'>
          {stages.map((item, index) => (
            <li
              key={item.key}
              className={cn(
                'flex items-center gap-3 text-sm transition-opacity',
                index > activeStage ? 'opacity-50' : 'opacity-100'
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                  index < activeStage ? 'border-white bg-white text-primary' : 'border-white/60'
                )}
              >
                {index < activeStage ? (
                  <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
                ) : (
                  <span className={cn('size-1 rounded-full bg-current', index === activeStage && 'animate-pulse')} />
                )}
              </span>
              {item.label}
            </li>
          ))}
        </ol>
      </div>
    </div>,
    document.body
  )
}
