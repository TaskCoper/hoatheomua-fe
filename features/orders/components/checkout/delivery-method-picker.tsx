'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Motorbike02Icon } from '@hugeicons/core-free-icons'
import { localizedMethodText, type CheckoutDeliveryOption } from '../../checkout-methods'
import { useFreeShipKm } from '../../hooks/use-free-ship-km'
import { calculateShippingFee } from '../../shipping-fee'
import CheckoutSection from './checkout-section'

interface DeliveryMethodPickerProps {
  methods: CheckoutDeliveryOption[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function DeliveryMethodPicker({ methods, selectedId, onSelect }: DeliveryMethodPickerProps) {
  const { t, locale } = useTranslation()
  const freeShipKm = useFreeShipKm()

  return (
    <CheckoutSection
      icon={Motorbike02Icon}
      title={t('orders.checkout.shippingHeading')}
      description={t('orders.checkout.shippingDescription')}
    >
      {methods.length === 0 ? (
        <div className='bg-secondary/25 px-4 py-8 text-center rounded-xl'>
          <p className='text-xs text-muted-foreground'>{t('orders.checkout.shippingEmpty')}</p>
        </div>
      ) : (
        <RadioGroup value={selectedId} onValueChange={onSelect} className='gap-2'>
          {methods.map((method) => {
            const isActive = method.id === selectedId
            const id = `ship-${method.id}`
            const description = localizedMethodText(method.description, locale)
            const quote = method.quote
            const shippingFee = calculateShippingFee(quote, freeShipKm)

            return (
              <label
                key={method.id}
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-2xl border bg-background/60 px-3 py-2.5 transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border/60 hover:bg-muted/40'
                )}
              >
                <RadioGroupItem id={id} value={method.id} />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{localizedMethodText(method.label, locale)}</p>
                  {description ? <p className='truncate text-xs text-muted-foreground'>{description}</p> : null}
                  {quote ? (
                    <p className='text-xs text-muted-foreground'>
                      {t('orders.checkout.shippingMeta', {
                        km: quote.distanceKm.toFixed(1),
                        min: Math.max(1, Math.round(quote.durationSeconds / 60))
                      })}
                    </p>
                  ) : null}
                </div>
                {quote ? (
                  <div className='shrink-0 text-right'>
                    <p className='text-sm font-semibold text-primary'>
                      {shippingFee === 0 ? t('orders.checkout.shippingFree') : formatVnd(shippingFee)}
                    </p>
                  </div>
                ) : null}
              </label>
            )
          })}
        </RadioGroup>
      )}
    </CheckoutSection>
  )
}
