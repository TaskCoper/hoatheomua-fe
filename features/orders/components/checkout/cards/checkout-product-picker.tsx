'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { cn } from '@/shared/utils'
import { useId } from 'react'
import type { LineCardCapacity } from '../../../cards/card-data'
import type { ProductCardType } from '../../../cards/types'
import type { CheckoutSummaryLine } from '../checkout-sidebar'

export type LineCardCapacities = ReadonlyMap<string, LineCardCapacity>

export const isCardEligibleLine = (line: CheckoutSummaryLine): boolean => !line.isResolving && !line.issue

/** A line takes another card while it has a free unit and is not already holding the other kind. */
export const isLineOpenForCard = (
  line: CheckoutSummaryLine,
  capacities: LineCardCapacities,
  cardType: ProductCardType
): boolean => {
  if (!isCardEligibleLine(line)) return false

  const capacity = capacities.get(line.lineId)
  if (!capacity || capacity.remaining < 1) return false

  return capacity.lockedType === null || capacity.lockedType === cardType
}

interface CheckoutProductPickerProps {
  lines: CheckoutSummaryLine[]
  value: string
  onChange: (lineId: string) => void
  label: string
  capacities: LineCardCapacities
  cardType: ProductCardType
  invalid?: boolean
}

export default function CheckoutProductPicker({
  lines,
  value,
  onChange,
  label,
  capacities,
  cardType,
  invalid
}: CheckoutProductPickerProps) {
  const { t } = useTranslation()
  const groupId = useId()

  const hasEligibleLine = lines.some(isCardEligibleLine)
  const hasOpenLine = lines.some((line) => isLineOpenForCard(line, capacities, cardType))

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-medium'>{label}</p>

      {!hasOpenLine ? (
        <div className='rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center'>
          <p className='text-xs text-muted-foreground'>
            {hasEligibleLine
              ? t('orders.checkout.cards.allProductsTaken')
              : t('orders.checkout.cards.noEligibleProducts')}
          </p>
        </div>
      ) : (
        <RadioGroup value={value} onValueChange={onChange} className='gap-2 sm:grid-cols-2' aria-label={label}>
          {lines.map((line) => {
            const capacity = capacities.get(line.lineId)
            const isSelectable = isLineOpenForCard(line, capacities, cardType)
            const isActive = line.lineId === value && isSelectable
            const id = `${groupId}-${line.lineId}`

            const meta =
              capacity && capacity.lockedType && capacity.lockedType !== cardType
                ? t('orders.checkout.cards.productHasOtherCard')
                : capacity && capacity.remaining < 1
                  ? t('orders.checkout.cards.productTaken')
                  : capacity && capacity.remaining < line.quantity
                    ? t('orders.checkout.cards.productRemaining', { count: capacity.remaining })
                    : [line.variantName, t('orders.checkout.lineQtyOnly', { qty: line.quantity })]
                        .filter(Boolean)
                        .join(' · ')

            return (
              <label
                key={line.lineId}
                htmlFor={id}
                aria-disabled={!isSelectable}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors',
                  'has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/30',
                  !isSelectable
                    ? 'cursor-not-allowed border-border/60 bg-muted/30 opacity-60'
                    : isActive
                      ? 'cursor-pointer border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                      : 'cursor-pointer border-border/60 bg-background/60 hover:bg-muted/40'
                )}
              >
                <RadioGroupItem id={id} value={line.lineId} disabled={!isSelectable} className='size-3.5 shrink-0' />

                <PreviewImage
                  src={line.image}
                  alt={line.name}
                  sizes='40px'
                  className='size-10 shrink-0 rounded-lg border border-border'
                />

                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-medium leading-5'>
                    {line.name || t('orders.checkout.sidebar.unknownProduct')}
                  </span>
                  <span className='block truncate text-xs text-muted-foreground'>{meta}</span>
                </span>
              </label>
            )
          })}
        </RadioGroup>
      )}

      {invalid ? <p className='text-xs text-destructive'>{t('orders.checkout.cards.productRequired')}</p> : null}
    </div>
  )
}
