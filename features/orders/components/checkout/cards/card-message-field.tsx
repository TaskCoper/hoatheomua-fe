'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { useId } from 'react'
import { CARD_MESSAGE_MAX_LENGTH, getCardMessageSurcharge } from '../../../cards/card-data'

interface CardMessageFieldProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
  invalid?: boolean
}

export default function CardMessageField({ value, onChange, label, placeholder, invalid }: CardMessageFieldProps) {
  const { t } = useTranslation()
  const id = useId()

  const surcharge = getCardMessageSurcharge(value.length)

  return (
    <Field data-invalid={invalid} className='gap-1.5'>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, CARD_MESSAGE_MAX_LENGTH))}
        maxLength={CARD_MESSAGE_MAX_LENGTH}
        rows={3}
        placeholder={placeholder}
        aria-invalid={invalid}
      />
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
        <span className={cn('text-xs', invalid ? 'text-destructive' : 'text-muted-foreground')}>
          {invalid
            ? t('orders.checkout.cards.messageRequired')
            : t('orders.checkout.cards.messageCount', { count: value.length, max: CARD_MESSAGE_MAX_LENGTH })}
        </span>
        {surcharge > 0 ? (
          <span className='text-xs font-medium text-primary'>
            {t('orders.checkout.cards.messageSurcharge', { price: formatVnd(surcharge) })}
          </span>
        ) : null}
      </div>
    </Field>
  )
}
