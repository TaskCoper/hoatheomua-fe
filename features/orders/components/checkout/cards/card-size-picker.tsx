'use client'

import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { CARD_SIZE_OPTIONS } from '../../../cards/card-data'
import { CARD_SIZE_LABEL_KEYS } from '../../../cards/card-labels'
import type { CardSizeId } from '../../../cards/types'
import CardOptionPicker from './card-option-picker'

interface CardSizePickerProps {
  value: CardSizeId
  onChange: (sizeId: CardSizeId) => void
}

export default function CardSizePicker({ value, onChange }: CardSizePickerProps) {
  const { t } = useTranslation()

  return (
    <CardOptionPicker<CardSizeId>
      label={t('orders.checkout.cards.size')}
      value={value}
      onChange={onChange}
      options={CARD_SIZE_OPTIONS.map((size) => ({
        value: size.id,
        label: t(CARD_SIZE_LABEL_KEYS[size.id]),
        hint: formatVnd(size.price)
      }))}
    />
  )
}
