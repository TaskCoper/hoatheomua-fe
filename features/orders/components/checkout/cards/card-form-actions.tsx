'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'

interface CardFormActionsProps {
  isEditing: boolean
  disabled?: boolean
  onSubmit: () => void
  onCancel: () => void
}

export default function CardFormActions({ isEditing, disabled, onSubmit, onCancel }: CardFormActionsProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-wrap items-center justify-end gap-2'>
      <Button type='button' variant='ghost' onClick={onCancel}>
        {t('orders.checkout.cards.cancel')}
      </Button>
      <Button type='button' onClick={onSubmit} disabled={disabled}>
        {isEditing ? t('orders.checkout.cards.saveChanges') : t('orders.checkout.cards.addToOrder')}
      </Button>
    </div>
  )
}
