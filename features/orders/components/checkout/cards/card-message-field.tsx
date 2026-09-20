'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { useId } from 'react'
import { countWords } from '../../../cards/card-config'
import { CARD_MESSAGE_MAX_LENGTH } from '../../../cards/card-data'

interface CardMessageFieldProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
  invalid?: boolean
  /** The word budget of the chosen size; messages are counted in words, not characters. */
  maxWords: number
  surcharge?: number
}

export default function CardMessageField({
  value,
  onChange,
  label,
  placeholder,
  invalid,
  maxWords,
  surcharge = 0
}: CardMessageFieldProps) {
  const { t } = useTranslation()
  const id = useId()

  const wordCount = countWords(value)
  const isOverBudget = maxWords > 0 && wordCount > maxWords

  return (
    <Field data-invalid={invalid} className='gap-1.5'>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, CARD_MESSAGE_MAX_LENGTH))}
        maxLength={CARD_MESSAGE_MAX_LENGTH}
        className='h-40'
        placeholder={placeholder}
        aria-invalid={invalid}
      />
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
        <span className={cn('text-xs', invalid ? 'text-destructive' : 'text-muted-foreground')}>
          {invalid
            ? wordCount === 0
              ? t('orders.checkout.cards.messageRequired')
              : t('orders.checkout.cards.messageMaxWords', { max: maxWords })
            : t('orders.checkout.cards.messageWordCount', { count: wordCount, max: maxWords })}
        </span>
        {!invalid && isOverBudget ? (
          <span className='text-xs font-medium text-destructive'>
            {t('orders.checkout.cards.messageMaxWords', { max: maxWords })}
          </span>
        ) : surcharge > 0 ? (
          <span className='text-xs font-medium text-primary'>
            {t('orders.checkout.cards.handwritingSurcharge', { price: formatVnd(surcharge) })}
          </span>
        ) : null}
      </div>
    </Field>
  )
}
