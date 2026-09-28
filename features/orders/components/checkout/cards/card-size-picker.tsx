'use client'

import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { CardSize } from '@/types/config.type'
import CardOptionPicker from './card-option-picker'

interface CardSizePickerProps {
  sizes: CardSize[]
  value: string
  onChange: (sizeName: string) => void
}

export default function CardSizePicker({ sizes, value, onChange }: CardSizePickerProps) {
  const { t } = useTranslation()

  return (
    <CardOptionPicker<string>
      label={t('orders.checkout.cards.size')}
      value={value}
      onChange={onChange}
      options={sizes.map((size) => ({
        value: size.name,
        label: size.name,
        hint: formatVnd(size.base_price)
      }))}
    />
  )
}
