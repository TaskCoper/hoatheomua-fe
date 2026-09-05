'use client'

import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatVnd } from '@/lib/currency'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { BankIcon, Motorbike02Icon, QrCodeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { localizedMethodText, type CheckoutDeliveryOption, type CheckoutPaymentOption } from '../../checkout-methods'
import { PaymentGateway, type TaxBusinessInfo } from '../../types'
import { InvoiceFields } from '../invoice-fields'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

interface StepPaymentProps {
  paymentMethods: CheckoutPaymentOption[]
  selectedPaymentMethodId: string
  onSelectPaymentMethod: (id: string) => void
  deliveryMethod: CheckoutDeliveryOption | null
  rawShippingFee: number
  isFreeShip: boolean
  onChangeDeliveryMethod: () => void
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: LookupState
  onTaxBusinessInfoChange: (info: TaxBusinessInfo | null) => void
  onTaxBusinessLookupStateChange: (state: LookupState) => void
}

export function StepPayment({
  paymentMethods,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  deliveryMethod,
  rawShippingFee,
  isFreeShip,
  onChangeDeliveryMethod,
  taxBusinessInfo,
  taxBusinessLookupState,
  onTaxBusinessInfoChange,
  onTaxBusinessLookupStateChange
}: StepPaymentProps) {
  const { t, locale } = useTranslation()

  const deliveryQuote = deliveryMethod?.quote

  return (
    <div className='flex flex-col gap-2'>
      {deliveryMethod ? (
        <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
          <header className='mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-4'>
            <div className='min-w-0'>
              <h2 className='font-title font-semibold'>{t('orders.checkout.shippingChosenTitle')}</h2>
              <p className='text-xs text-muted-foreground'>{t('orders.checkout.shippingChosenDescription')}</p>
            </div>
            <Button type='button' variant='outline' size='sm' className='shrink-0' onClick={onChangeDeliveryMethod}>
              {t('orders.checkout.changeAddress')}
            </Button>
          </header>

          <div className='flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 px-3 py-3'>
            <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Motorbike02Icon} strokeWidth={2} className='size-4' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{localizedMethodText(deliveryMethod.label, locale)}</p>
              <p className='truncate text-xs text-muted-foreground'>
                {deliveryQuote
                  ? t('orders.checkout.shippingMeta', {
                      km: deliveryQuote.distanceKm.toFixed(1),
                      min: Math.max(1, Math.round(deliveryQuote.durationSeconds / 60))
                    })
                  : localizedMethodText(deliveryMethod.description, locale)}
              </p>
            </div>
            <div className='shrink-0 text-right'>
              {isFreeShip ? (
                <>
                  <p className='text-sm font-semibold text-primary'>{t('orders.checkout.shippingFree')}</p>
                  <p className='text-xs text-muted-foreground line-through'>{formatVnd(rawShippingFee)}</p>
                </>
              ) : (
                <p className='text-sm font-semibold text-primary'>{formatVnd(rawShippingFee)}</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
        <header className='mb-4 border-b border-border/70 pb-4'>
          <h2 className='font-title font-semibold'>{t('orders.checkout.paymentTitle')}</h2>
          <p className='text-xs text-muted-foreground'>{t('orders.checkout.paymentDescription')}</p>
        </header>

        {paymentMethods.length === 0 ? (
          <div className='bg-secondary/25 px-4 py-8 text-center rounded-xl'>
            <p className='text-xs text-muted-foreground'>{t('orders.checkout.paymentEmpty')}</p>
          </div>
        ) : (
          <RadioGroup value={selectedPaymentMethodId} onValueChange={onSelectPaymentMethod} className='gap-2'>
            {paymentMethods.map((method) => {
              const isActive = selectedPaymentMethodId === method.id
              const id = `payment-${method.id}`
              const icon = method.gateway === PaymentGateway.Sepay ? QrCodeIcon : BankIcon
              return (
                <label
                  key={method.id}
                  htmlFor={id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-2xl border bg-background/60 px-3 py-3 transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border/60 hover:bg-muted/40'
                  )}
                >
                  <RadioGroupItem id={id} value={method.id} />
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full',
                      isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <HugeiconsIcon icon={icon} strokeWidth={2} className='size-4' />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>{localizedMethodText(method.label, locale)}</p>
                    <p className='text-xs text-muted-foreground'>{localizedMethodText(method.description, locale)}</p>
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        )}
      </section>

      <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
        <header className='mb-4 border-b border-border/70 pb-4'>
          <h2 className='font-title font-semibold'>{t('orders.checkout.invoiceTitle')}</h2>
          <p className='text-xs text-muted-foreground'>{t('orders.checkout.invoiceDescription')}</p>
        </header>

        <InvoiceFields
          taxBusinessInfo={taxBusinessInfo}
          taxBusinessLookupState={taxBusinessLookupState}
          onTaxBusinessInfoChange={onTaxBusinessInfoChange}
          onTaxBusinessLookupStateChange={onTaxBusinessLookupStateChange}
        />
      </section>
    </div>
  )
}
