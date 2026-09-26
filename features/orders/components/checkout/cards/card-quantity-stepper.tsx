'use client'

import { Button } from '@/components/ui/button'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CARD_MAX_QUANTITY } from '../../../cards/card-data'

interface CardQuantityStepperProps {
  value: number
  onChange: (quantity: number) => void
  unitPrice: number
  /** How many units this card may cover - what its product has left without a card. */
  max: number
  variant?: 'boxed' | 'inline'
}

export default function CardQuantityStepper({
  value,
  onChange,
  unitPrice,
  max,
  variant = 'boxed'
}: CardQuantityStepperProps) {
  const { t } = useTranslation()

  const isInline = variant === 'inline'
  const limit = Math.max(1, Math.min(max, CARD_MAX_QUANTITY))

  const hint =
    value >= limit
      ? t('orders.checkout.cards.maxQuantity', { max: limit })
      : unitPrice > 0 && value > 1
        ? t('orders.checkout.cards.unitPriceHint', { price: formatVnd(unitPrice) })
        : null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1',
        isInline ? 'justify-start' : 'justify-between rounded-2xl border border-border/60 bg-background/60 px-3 py-2.5'
      )}
    >
      <div className='min-w-0'>
        <p className={cn('text-sm', isInline ? 'text-muted-foreground' : 'font-medium')}>
          {t('orders.checkout.cards.quantity')}
        </p>
        {hint && !isInline ? <p className='text-xs text-muted-foreground'>{hint}</p> : null}
      </div>

      <div className='inline-flex shrink-0 items-center divide-x divide-border/70 rounded-full border border-border/70'>
        <Button
          type='button'
          size='icon-xs'
          variant='ghost'
          className='rounded-l-full rounded-r-none'
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          aria-label={t('orders.checkout.cards.decrease')}
        >
          <HugeiconsIcon icon={MinusSignIcon} className='size-3.5' />
        </Button>
        <span className='min-w-8 text-center text-sm font-semibold tabular-nums text-primary'>{value}</span>
        <Button
          type='button'
          size='icon-xs'
          variant='ghost'
          className='rounded-l-none rounded-r-full'
          onClick={() => onChange(Math.min(limit, value + 1))}
          disabled={value >= limit}
          aria-label={t('orders.checkout.cards.increase')}
        >
          <HugeiconsIcon icon={PlusSignIcon} className='size-3.5' />
        </Button>
      </div>

      {hint && isInline ? <span className='text-xs text-muted-foreground'>{hint}</span> : null}
    </div>
  )
}
