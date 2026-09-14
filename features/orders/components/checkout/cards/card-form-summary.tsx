'use client'

import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import CardQuantityStepper from './card-quantity-stepper'

interface CardFormSummaryProps {
  price: number
  /** The standard card ships with the flowers, so it shows as free rather than 0đ. */
  free?: boolean
  quantity?: {
    value: number
    unitPrice: number
    max: number
    onChange: (quantity: number) => void
  } | null
}

export default function CardFormSummary({ price, free, quantity }: CardFormSummaryProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-border/70 pt-4'>
      {quantity ? (
        <CardQuantityStepper
          variant='inline'
          value={quantity.value}
          unitPrice={quantity.unitPrice}
          max={quantity.max}
          onChange={quantity.onChange}
        />
      ) : (
        <span />
      )}

      <p className='flex items-baseline gap-2'>
        <span className='text-sm text-muted-foreground'>{t('orders.checkout.cards.cardPrice')}</span>
        <span className='font-title text-lg font-bold text-primary'>
          {free ? t('orders.checkout.cards.free') : formatVnd(price)}
        </span>
      </p>
    </div>
  )
}
