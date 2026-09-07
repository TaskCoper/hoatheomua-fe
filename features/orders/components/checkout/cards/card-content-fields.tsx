'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useId } from 'react'
import { CARD_NAME_MAX_LENGTH } from '../../../cards/card-data'
import type { CardContent } from '../../../cards/types'
import CardMessageField from './card-message-field'

interface CardContentFieldsProps {
  value: CardContent
  onChange: (content: CardContent) => void
  messageInvalid?: boolean
}

export default function CardContentFields({ value, onChange, messageInvalid }: CardContentFieldsProps) {
  const { t } = useTranslation()
  const receiverId = useId()
  const senderId = useId()

  return (
    <div className='space-y-3'>
      <div className='grid gap-3 sm:grid-cols-2'>
        <Field className='gap-1.5'>
          <FieldLabel htmlFor={receiverId} className='gap-0.5'>
            {t('orders.checkout.cards.receiver')}
            <span className='font-normal text-muted-foreground'>{t('orders.checkout.cards.optionalField')}</span>
          </FieldLabel>
          <Input
            id={receiverId}
            value={value.receiver}
            onChange={(event) => onChange({ ...value, receiver: event.target.value.slice(0, CARD_NAME_MAX_LENGTH) })}
            maxLength={CARD_NAME_MAX_LENGTH}
            placeholder={t('orders.checkout.cards.receiverPlaceholder')}
          />
        </Field>

        <Field className='gap-1.5'>
          <FieldLabel htmlFor={senderId} className='gap-0.5'>
            {t('orders.checkout.cards.sender')}
            <span className='font-normal text-muted-foreground'>{t('orders.checkout.cards.optionalField')}</span>
          </FieldLabel>
          <Input
            id={senderId}
            value={value.sender}
            onChange={(event) => onChange({ ...value, sender: event.target.value.slice(0, CARD_NAME_MAX_LENGTH) })}
            maxLength={CARD_NAME_MAX_LENGTH}
            placeholder={t('orders.checkout.cards.senderPlaceholder')}
          />
        </Field>
      </div>

      <CardMessageField
        value={value.message}
        onChange={(message) => onChange({ ...value, message })}
        label={t('orders.checkout.cards.message')}
        placeholder={t('orders.checkout.cards.messagePlaceholder')}
        invalid={messageInvalid}
      />
    </div>
  )
}
