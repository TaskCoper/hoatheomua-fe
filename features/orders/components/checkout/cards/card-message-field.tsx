'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { useId } from 'react'
import { countWords } from '../../../cards/card-config'

/**
 * Keeps the first `maxWords` words and drops whatever came after them, with the spacing the
 * writer typed left as it is - a message is measured in words, never in characters.
 */
const clampToWordBudget = (value: string, maxWords: number): string => {
  const words = [...value.matchAll(/\S+/g)]
  if (words.length <= maxWords) return value

  const last = words[maxWords - 1]
  return value.slice(0, (last.index ?? 0) + last[0].length)
}

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

  // Typing or pasting past the budget stops at the last word that fits. A message that is
  // already over it - the size was picked smaller underneath it - is left alone rather than
  // cut down on the next keystroke.
  const handleChange = (next: string) => {
    onChange(maxWords > 0 && !isOverBudget ? clampToWordBudget(next, maxWords) : next)
  }

  return (
    <Field data-invalid={invalid} className='gap-1.5'>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
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
