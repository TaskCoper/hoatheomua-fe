'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { CardWritingMethod, OrderCardVersion } from '../../cards/types'
import OrderCardArtwork from './order-card-artwork'

interface OrderCardVersionStripProps {
  versions: OrderCardVersion[]
  /** The version on screen. */
  activeVersionId: string
  /** The version that goes to print, marked with a tick. */
  selectedVersionId: string
  writingMethod: CardWritingMethod
  disabled?: boolean
  onSelect: (versionId: string) => void
  className?: string
}

export default function OrderCardVersionStrip({
  versions,
  activeVersionId,
  selectedVersionId,
  writingMethod,
  disabled,
  onSelect,
  className
}: OrderCardVersionStripProps) {
  const { t } = useTranslation()

  if (versions.length === 0) {
    return (
      <p className='rounded-2xl bg-secondary/20 px-3 py-4 text-center text-xs text-muted-foreground ring-1 ring-foreground/5'>
        {t('orders.cards.versions.empty')}
      </p>
    )
  }

  return (
    <ul className={cn('-mx-0.5 flex snap-x gap-2 overflow-x-auto px-0.5 pb-1', className)}>
      {versions.map((version) => {
        const isActive = version.id === activeVersionId
        const isPrinted = version.id === selectedVersionId

        return (
          <li key={version.id} className='snap-start'>
            <button
              type='button'
              onClick={() => onSelect(version.id)}
              disabled={disabled}
              aria-label={t('orders.cards.versions.select', { index: version.label })}
              aria-pressed={isActive}
              className={cn(
                'block w-14 cursor-pointer rounded-2xl p-1 ring-1 ring-inset transition-colors sm:w-16',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60',
                isActive ? 'bg-primary/5 ring-primary/25' : 'ring-foreground/5 hover:bg-secondary/30'
              )}
            >
              <span className='relative block'>
                <OrderCardArtwork
                  version={version}
                  writingMethod={writingMethod}
                  sizes='64px'
                  className='aspect-3/4 w-full rounded-xl ring-1 ring-foreground/5'
                />

                {isPrinted ? (
                  <span className='absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-leaf text-white ring-2 ring-card'>
                    <HugeiconsIcon icon={Tick02Icon} className='size-2.5' strokeWidth={3} />
                  </span>
                ) : null}
              </span>

              <span
                className={cn(
                  'mt-1 block text-center text-[0.7rem] font-semibold tabular-nums',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {version.label}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
