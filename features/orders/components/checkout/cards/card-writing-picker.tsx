'use client'

import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { CARD_WRITING_METHOD_LABEL_KEYS } from '../../../cards/card-labels'
import type { CardWritingMethod } from '../../../cards/types'
import CardOptionPicker from './card-option-picker'

const WRITING_METHODS: CardWritingMethod[] = ['typed', 'handwritten']

interface CardWritingPickerProps {
  value: CardWritingMethod
  onChange: (writingMethod: CardWritingMethod) => void
  handwritingPrice?: number
}

export default function CardWritingPicker({ value, onChange, handwritingPrice = 0 }: CardWritingPickerProps) {
  const { t } = useTranslation()

  return (
    <CardOptionPicker<CardWritingMethod>
      label={t('orders.checkout.cards.writingMethod')}
      value={value}
      onChange={onChange}
      options={WRITING_METHODS.map((method) => ({
        value: method,
        label: t(CARD_WRITING_METHOD_LABEL_KEYS[method]),
        hint:
          method === 'handwritten' && handwritingPrice > 0
            ? t('orders.checkout.cards.surcharge', { price: formatVnd(handwritingPrice) })
            : undefined
      }))}
    />
  )
}
