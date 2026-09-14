'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { CardContent } from '../../../cards/types'
import CardMessageField from './card-message-field'

interface CardContentFieldsProps {
  value: CardContent
  onChange: (content: CardContent) => void
  messageInvalid?: boolean
  showSurcharge?: boolean
}

export default function CardContentFields({ value, onChange, messageInvalid, showSurcharge }: CardContentFieldsProps) {
  const { t } = useTranslation()

  return (
    <CardMessageField
      value={value.message}
      onChange={(message) => onChange({ message })}
      label={t('orders.checkout.cards.message')}
      placeholder={t('orders.checkout.cards.messagePlaceholder')}
      invalid={messageInvalid}
      showSurcharge={showSurcharge}
    />
  )
}
