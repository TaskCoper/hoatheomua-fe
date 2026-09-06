'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useId } from 'react'
import type { GeneratedCard } from '../../../cards/types'
import CardPreviewImage from './card-preview-image'

interface CardHistoryGalleryProps {
  generatedCards: GeneratedCard[]
  value: string
  onChange: (generatedCardId: string) => void
  invalid?: boolean
}

export default function CardHistoryGallery({ generatedCards, value, onChange, invalid }: CardHistoryGalleryProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const groupId = useId()

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-medium'>{t('orders.checkout.cards.historySelect')}</p>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className='grid grid-cols-3 gap-2 sm:grid-cols-6'
        aria-label={t('orders.checkout.cards.historySelect')}
      >
        {generatedCards.map((card) => {
          const isActive = card.id === value
          const id = `${groupId}-${card.id}`

          return (
            <label
              key={card.id}
              htmlFor={id}
              className={cn(
                'cursor-pointer space-y-1 rounded-2xl border p-1.5 transition-colors',
                'has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/30',
                isActive
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border/60 hover:bg-muted/40'
              )}
            >
              <RadioGroupItem id={id} value={card.id} className='sr-only hidden' />

              <span className='relative block'>
                <CardPreviewImage
                  src={card.imageUrl}
                  alt={card.content.message}
                  sizes='(min-width: 640px) 8vw, 30vw'
                  className='aspect-[3/4] w-full rounded-xl'
                />

                <span
                  className={cn(
                    'absolute right-1 top-1 grid size-5 place-items-center rounded-full border transition-colors',
                    isActive ? 'border-white bg-white text-primary' : 'border-white/60 text-transparent'
                  )}
                >
                  <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
                </span>
              </span>

              <span className='block truncate text-[0.6875rem] font-medium tabular-nums'>
                {formatDate(card.createdAt, 'dateShort2y')}
              </span>
            </label>
          )
        })}
      </RadioGroup>

      {invalid ? <p className='text-xs text-destructive'>{t('orders.checkout.cards.historyRequired')}</p> : null}
    </div>
  )
}
