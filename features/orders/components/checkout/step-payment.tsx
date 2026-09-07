'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { FeatureUnavailableNotice } from '@/shared/components/feature-unavailable-notice'
import { cn } from '@/shared/utils'
import { BankIcon, Invoice01Icon, QrCodeIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { localizedMethodText, type CheckoutPaymentOption } from '../../checkout-methods'
import { PaymentGateway, type TaxBusinessInfo } from '../../types'
import { InvoiceFields } from '../invoice-fields'
import CheckoutSection from './checkout-section'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

interface StepPaymentProps {
  paymentMethods: CheckoutPaymentOption[]
  selectedPaymentMethodId: string
  onSelectPaymentMethod: (id: string) => void
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: LookupState
  onTaxBusinessInfoChange: (info: TaxBusinessInfo | null) => void
  onTaxBusinessLookupStateChange: (state: LookupState) => void
  /** False while payments are switched off - the methods stay on screen, just inert. */
  canPay: boolean
}

export default function StepPayment({
  paymentMethods,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  taxBusinessInfo,
  taxBusinessLookupState,
  onTaxBusinessInfoChange,
  onTaxBusinessLookupStateChange,
  canPay
}: StepPaymentProps) {
  const { t, locale } = useTranslation()

  return (
    <div className='flex flex-col gap-2'>
      <CheckoutSection
        icon={Wallet01Icon}
        title={t('orders.checkout.paymentTitle')}
        description={t('orders.checkout.paymentDescription')}
      >
        {paymentMethods.length === 0 ? (
          <div className='bg-secondary/25 px-4 py-8 text-center rounded-xl'>
            <p className='text-xs text-muted-foreground'>{t('orders.checkout.paymentEmpty')}</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {canPay ? null : <FeatureUnavailableNotice />}

            <RadioGroup
              value={selectedPaymentMethodId}
              onValueChange={onSelectPaymentMethod}
              disabled={!canPay}
              className={cn('gap-2', !canPay && 'opacity-60')}
            >
              {paymentMethods.map((method) => {
                const isActive = selectedPaymentMethodId === method.id
                const id = `payment-${method.id}`
                const icon = method.gateway === PaymentGateway.Sepay ? QrCodeIcon : BankIcon
                return (
                  <label
                    key={method.id}
                    htmlFor={id}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border bg-background/60 px-3 py-3 transition-colors',
                      canPay ? 'cursor-pointer' : 'cursor-not-allowed',
                      isActive
                        ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                        : cn('border-border/60', canPay && 'hover:bg-muted/40')
                    )}
                  >
                    <RadioGroupItem id={id} value={method.id} disabled={!canPay} />
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
          </div>
        )}
      </CheckoutSection>

      <CheckoutSection
        icon={Invoice01Icon}
        title={t('orders.checkout.invoiceTitle')}
        description={t('orders.checkout.invoiceDescription')}
      >
        <InvoiceFields
          taxBusinessInfo={taxBusinessInfo}
          taxBusinessLookupState={taxBusinessLookupState}
          onTaxBusinessInfoChange={onTaxBusinessInfoChange}
          onTaxBusinessLookupStateChange={onTaxBusinessLookupStateChange}
        />
      </CheckoutSection>
    </div>
  )
}
