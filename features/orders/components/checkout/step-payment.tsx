'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { Atm01Icon, BankIcon, CreditCardIcon, QrCodeIcon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import type { AhamoveResult } from '../../ahamove.type'
import type { TaxBusinessInfo } from '../../types'
import { PaymentMethod, PaymentMethodDescription } from '../../types'
import { InvoiceFields } from '../invoice-fields'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})
const formatVnd = (value: number) => vndFormatter.format(value)

interface PaymentMethodOption {
  value: PaymentMethod
  labelKey: I18nKey
  descriptionKey: I18nKey
  icon: IconSvgElement
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: PaymentMethod[1],
    labelKey: 'orders.checkout.paymentMethod.va.label',
    descriptionKey: PaymentMethodDescription[PaymentMethod[1]],
    icon: BankIcon
  },
  {
    value: PaymentMethod[3],
    labelKey: 'orders.checkout.paymentMethod.card.label',
    descriptionKey: PaymentMethodDescription[PaymentMethod[3]],
    icon: CreditCardIcon
  },
  {
    value: PaymentMethod[5],
    labelKey: 'orders.checkout.paymentMethod.atm.label',
    descriptionKey: PaymentMethodDescription[PaymentMethod[5]],
    icon: Atm01Icon
  },
  {
    value: PaymentMethod[6],
    labelKey: 'orders.checkout.paymentMethod.vnPayQr.label',
    descriptionKey: PaymentMethodDescription[PaymentMethod[6]],
    icon: QrCodeIcon
  }
]

interface StepPaymentProps {
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (value: PaymentMethod) => void
  shippingOptions: AhamoveResult[]
  selectedServiceId: string
  onSelectShipping: (id: string) => void
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: LookupState
  onTaxBusinessInfoChange: (info: TaxBusinessInfo | null) => void
  onTaxBusinessLookupStateChange: (state: LookupState) => void
}

export function StepPayment({
  paymentMethod,
  onPaymentMethodChange,
  shippingOptions,
  selectedServiceId,
  onSelectShipping,
  taxBusinessInfo,
  taxBusinessLookupState,
  onTaxBusinessInfoChange,
  onTaxBusinessLookupStateChange
}: StepPaymentProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4'>
      <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
        <header className='mb-4 border-b border-border/70 pb-4'>
          <h2 className='font-heading text-lg font-semibold'>{t('orders.checkout.paymentTitle')}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{t('orders.checkout.paymentDescription')}</p>
        </header>

        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className='gap-2'>
          {PAYMENT_METHODS.map((method) => {
            const isActive = paymentMethod === method.value
            const id = `payment-${method.value}`
            return (
              <label
                key={method.value}
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-2xl border bg-background/60 px-3 py-3 transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border/60 hover:bg-muted/40'
                )}
              >
                <RadioGroupItem id={id} value={method.value} />
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <HugeiconsIcon icon={method.icon} strokeWidth={2} className='size-4' />
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium'>{t(method.labelKey)}</p>
                  <p className='text-xs text-muted-foreground'>{t(method.descriptionKey)}</p>
                </div>
              </label>
            )
          })}
        </RadioGroup>
      </section>

      <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
        <header className='mb-4 border-b border-border/70 pb-4'>
          <h2 className='font-heading text-lg font-semibold'>{t('orders.checkout.shippingHeading')}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{t('orders.checkout.shippingDescription')}</p>
        </header>

        {shippingOptions.length === 0 ? (
          <p className='text-sm text-muted-foreground'>{t('orders.checkout.shippingEmpty')}</p>
        ) : (
          <RadioGroup value={selectedServiceId} onValueChange={onSelectShipping} className='gap-2'>
            {shippingOptions.map((service) => {
              const isActive = service.service_id === selectedServiceId
              const id = `ship-${service.service_id}`
              return (
                <label
                  key={service.service_id}
                  htmlFor={id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-2xl border bg-background/60 px-3 py-2.5 transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border/60 hover:bg-muted/40'
                  )}
                >
                  <RadioGroupItem id={id} value={service.service_id} />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{service.service_id}</p>
                    <p className='text-xs text-muted-foreground'>
                      {t('orders.checkout.shippingMeta', {
                        km: (service.data?.distance ?? 0).toFixed(1),
                        min: Math.max(1, Math.round((service.data?.duration ?? 0) / 60))
                      })}
                    </p>
                  </div>
                  <span className='text-sm font-semibold text-primary'>{formatVnd(service.data?.total_fee ?? 0)}</span>
                </label>
              )
            })}
          </RadioGroup>
        )}
      </section>

      <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
        <header className='mb-4 border-b border-border/70 pb-4'>
          <h2 className='font-heading text-lg font-semibold'>{t('orders.checkout.invoiceTitle')}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{t('orders.checkout.invoiceDescription')}</p>
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
