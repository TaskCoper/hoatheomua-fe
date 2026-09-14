'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { AiMagicIcon, ArrowRight02Icon, Mail01Icon, Time02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { CARD_TYPE_HINT_KEYS, CARD_TYPE_LABEL_KEYS } from '../../../cards/card-labels'
import type { CheckoutCardType } from '../../../cards/types'

export const CARD_TYPE_ICONS: Record<CheckoutCardType, IconSvgElement> = {
  standard: Mail01Icon,
  ai: AiMagicIcon,
  history: Time02Icon
}

export const CARD_TYPES: CheckoutCardType[] = ['standard', 'ai', 'history']

interface CardTypePickerProps {
  /** Types that cannot be added right now, each mapped to the reason shown in its tile. */
  unavailableTypes: Partial<Record<CheckoutCardType, I18nKey>>
  onPick: (type: CheckoutCardType) => void
}

export default function CardTypePicker({ unavailableTypes, onPick }: CardTypePickerProps) {
  const { t } = useTranslation()

  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {CARD_TYPES.map((type) => {
        const unavailableReason = unavailableTypes[type]
        const isDisabled = !!unavailableReason

        return (
          <button
            key={type}
            type='button'
            onClick={() => onPick(type)}
            disabled={isDisabled}
            className={cn(
              'group relative flex min-h-40 flex-col items-start overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-200',
              isDisabled
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.035] hover:shadow-[0_0.6rem_1.25rem_rgb(81_108_108/10%)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30'
            )}
          >
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-primary/10',
                isDisabled ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
              )}
            >
              <HugeiconsIcon icon={CARD_TYPE_ICONS[type]} strokeWidth={1.75} className='size-5' />
            </span>

            <span className='mt-3 min-w-0'>
              <span className='block text-sm font-semibold'>{t(CARD_TYPE_LABEL_KEYS[type])}</span>
              <span className='mt-1 block text-xs leading-relaxed text-muted-foreground'>
                {t(unavailableReason ?? CARD_TYPE_HINT_KEYS[type])}
              </span>
            </span>

            {isDisabled ? null : (
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                strokeWidth={2}
                className='absolute bottom-4 right-4 size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary'
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
