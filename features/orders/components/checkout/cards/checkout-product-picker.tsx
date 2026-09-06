'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { useId } from 'react'
import type { CheckoutSummaryLine } from '../checkout-sidebar'
import CardPreviewImage from './card-preview-image'

export const isCardEligibleLine = (line: CheckoutSummaryLine): boolean => !line.isResolving && !line.issue

interface CheckoutProductPickerProps {
  lines: CheckoutSummaryLine[]
  value: string
  onChange: (lineId: string) => void
  label: string
  invalid?: boolean
}

export default function CheckoutProductPicker({ lines, value, onChange, label, invalid }: CheckoutProductPickerProps) {
  const { t } = useTranslation()
  const groupId = useId()

  const hasEligibleLine = lines.some(isCardEligibleLine)

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-medium'>{label}</p>

      {!hasEligibleLine ? (
        <div className='rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center'>
          <p className='text-xs text-muted-foreground'>{t('orders.checkout.cards.noEligibleProducts')}</p>
        </div>
      ) : (
        <RadioGroup value={value} onValueChange={onChange} className='gap-2 sm:grid-cols-2' aria-label={label}>
          {lines.map((line) => {
            const isEligible = isCardEligibleLine(line)
            const isActive = line.lineId === value && isEligible
            const id = `${groupId}-${line.lineId}`

            return (
              <label
                key={line.lineId}
                htmlFor={id}
                aria-disabled={!isEligible}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors',
                  'has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/30',
                  !isEligible
                    ? 'cursor-not-allowed border-border/60 bg-muted/30 opacity-60'
                    : isActive
                      ? 'cursor-pointer border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                      : 'cursor-pointer border-border/60 bg-background/60 hover:bg-muted/40'
                )}
              >
                <RadioGroupItem id={id} value={line.lineId} disabled={!isEligible} className='size-3.5 shrink-0' />

                <CardPreviewImage
                  src={line.image}
                  alt={line.name}
                  sizes='40px'
                  className='size-10 shrink-0 rounded-lg border border-border'
                />

                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-medium leading-5'>
                    {line.name || t('orders.checkout.sidebar.unknownProduct')}
                  </span>
                  <span className='block truncate text-xs text-muted-foreground'>
                    {[line.variantName, t('orders.checkout.lineQtyOnly', { qty: line.quantity })]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
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
