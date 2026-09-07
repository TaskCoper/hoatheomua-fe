'use client'

import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import CardQuantityStepper from './card-quantity-stepper'

interface CardFormSummaryProps {
  price: number
  quantity?: {
    value: number
    unitPrice: number
    onChange: (quantity: number) => void
  } | null
}

export default function CardFormSummary({ price, quantity }: CardFormSummaryProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-border/70 pt-4'>
      {quantity ? (
        <CardQuantityStepper
          variant='inline'
          value={quantity.value}
          unitPrice={quantity.unitPrice}
          onChange={quantity.onChange}
        />
      ) : (
        <span />
      )}

      <p className='flex items-baseline gap-2'>
        <span className='text-sm text-muted-foreground'>{t('orders.checkout.cards.cardPrice')}</span>
        <span className='font-title text-lg font-bold text-primary'>{formatVnd(price)}</span>
      </p>
    </div>
  )
}
