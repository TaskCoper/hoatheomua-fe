'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { HugeiconsIcon } from '@hugeicons/react'
import { CARD_TYPE_LABEL_KEYS } from '../../../cards/card-labels'
import type { CheckoutCardType } from '../../../cards/types'
import { CARD_TYPE_ICONS } from './card-type-picker'

interface CardFormHeaderProps {
  type: CheckoutCardType
}

export default function CardFormHeader({ type }: CardFormHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className='border-b border-border/70 pb-4'>
      <h2 className='flex min-w-0 items-center gap-2 font-title font-semibold'>
        <HugeiconsIcon icon={CARD_TYPE_ICONS[type]} strokeWidth={1.75} className='size-4 shrink-0 text-primary' />
        <span className='truncate'>{t(CARD_TYPE_LABEL_KEYS[type])}</span>
      </h2>
    </header>
  )
}
