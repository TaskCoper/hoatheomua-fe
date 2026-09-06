'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { HugeiconsIcon } from '@hugeicons/react'
import { CARD_TYPE_LABEL_KEYS } from '../../../cards/card-labels'
import type { CheckoutCardType } from '../../../cards/types'
import { CARD_TYPE_ICONS } from './card-type-picker'

interface CardFormHeaderProps {
  type: CheckoutCardType
  isEditing: boolean
  disabled?: boolean
  onSubmit: () => void
  onCancel: () => void
}

export default function CardFormHeader({ type, isEditing, disabled, onSubmit, onCancel }: CardFormHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className='flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/70 pb-4'>
      <h2 className='flex min-w-0 items-center gap-2 font-title font-semibold'>
        <HugeiconsIcon icon={CARD_TYPE_ICONS[type]} strokeWidth={1.75} className='size-4 shrink-0 text-primary' />
        <span className='truncate'>{t(CARD_TYPE_LABEL_KEYS[type])}</span>
      </h2>

      <div className='ml-auto flex shrink-0 items-center gap-2'>
        <Button type='button' variant='ghost' size='sm' onClick={onCancel}>
          {t('orders.checkout.cards.cancel')}
        </Button>
        <Button type='button' size='sm' onClick={onSubmit} disabled={disabled}>
          {isEditing ? t('orders.checkout.cards.saveChanges') : t('orders.checkout.cards.addToOrder')}
        </Button>
      </div>
    </header>
  )
}
