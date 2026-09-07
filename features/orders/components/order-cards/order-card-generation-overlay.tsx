'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ORDER_CARD_STAGE_KEYS } from '../../hooks/use-order-card-designer'

interface OrderCardGenerationOverlayProps {
  versionLabel: number
  stage: number
}

export default function OrderCardGenerationOverlay({ versionLabel, stage }: OrderCardGenerationOverlayProps) {
  const { t } = useTranslation()

  return (
    <div className='absolute inset-0 z-10 flex items-end bg-primary/85 p-5 text-white backdrop-blur-sm sm:p-7'>
      <div className='w-full' aria-live='polite' aria-atomic='true'>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-white ring-1 ring-white/25'>
          <HugeiconsIcon icon={SparklesIcon} className='size-3' />
          {t('orders.cards.generation.badge')}
        </span>

        <p className='mt-4 text-pretty font-title text-xl font-bold leading-tight sm:text-2xl'>
          {t('orders.cards.generation.title', { index: versionLabel })}
        </p>

        <ol className='mt-5 space-y-2.5 border-t border-white/25 pt-4'>
          {ORDER_CARD_STAGE_KEYS.map((key, index) => (
            <li
              key={key}
              className={cn(
                'flex items-center gap-2.5 text-xs transition-opacity sm:text-sm',
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
              {t(`orders.cards.generation.stages.${key}`)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
