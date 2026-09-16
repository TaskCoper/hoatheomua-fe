'use client'

import { STUDIO_GENERATION_STAGE_KEYS } from '@/features/studio/studio-data'
import { cn } from '@/shared/utils'
import { SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

interface StudioGenerationOverlayProps {
  name: string
  stage: number
}

export default function StudioGenerationOverlay({ name, stage }: StudioGenerationOverlayProps) {
  const t = useTranslations('studio.generation')

  return (
    <div className='absolute inset-0 z-20 flex items-end bg-primary/80 p-6 text-white backdrop-blur-sm sm:p-9 lg:p-12'>
      <div className='w-full max-w-md' aria-live='polite' aria-atomic='true'>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md'>
          <HugeiconsIcon icon={SparklesIcon} className='size-3' />
          {t('generating')}
        </span>

        <p className='mt-5 text-pretty font-title text-2xl font-bold leading-tight text-white sm:text-3xl'>
          {t('creating', { name })}
        </p>

        <ol className='mt-6 space-y-3 border-t border-white/25 pt-5'>
          {STUDIO_GENERATION_STAGE_KEYS.map((key, index) => (
            <li
              key={key}
              className={cn(
                'flex items-center gap-3 text-sm transition-opacity',
                index > stage ? 'opacity-50' : 'opacity-100'
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                  index < stage ? 'border-white bg-white text-primary' : 'border-white/60'
                )}
              >
                {index < stage ? (
                  <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
                ) : (
                  <span className='size-1 rounded-full bg-current' />
                )}
              </span>
              {t(`stages.${key}`)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
