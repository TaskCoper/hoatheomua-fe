'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { BankIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { AhamoveResult } from '../../ahamove.type'
import type { TaxBusinessInfo } from '../../types'
import { InvoiceFields } from '../invoice-fields'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})
const formatVnd = (value: number) => vndFormatter.format(value)

interface StepPaymentProps {
  shippingOptions: AhamoveResult[]
  selectedServiceId: string
  onSelectShipping: (id: string) => void
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: LookupState
  onTaxBusinessInfoChange: (info: TaxBusinessInfo | null) => void
  onTaxBusinessLookupStateChange: (state: LookupState) => void
}

export function StepPayment({
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

        <div className='rounded-2xl border border-primary/30 bg-primary/5 p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <span className='grid size-8 place-items-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={BankIcon} strokeWidth={2} className='size-4' />
            </span>
            <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.bankTransferTitle')}</h3>
          </div>
          <p className='text-sm text-muted-foreground'>{t('orders.checkout.bankTransferHint')}</p>
        </div>
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
                    <div className='flex items-center gap-2'>
                      <p className='truncate text-sm font-medium'>{service.service_id}</p>
                    </div>
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

      {/* <div className='flex items-start gap-2 rounded-2xl bg-secondary/30 px-4 py-3 text-xs text-muted-foreground'>
        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className='mt-0.5 size-4 shrink-0' />
        <p>{t('orders.checkout.paymentNote')}</p>
      </div> */}
    </div>
  )
}
