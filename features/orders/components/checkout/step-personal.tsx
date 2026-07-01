'use client'

import { Spinner } from '@/components/ui/spinner'
import type { Address } from '@/features/addresses/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { CheckoutFields } from '../checkout-fields'
import type { TaxBusinessInfo } from '../../types'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

interface StepPersonalProps {
  addresses: Address[]
  isLoadingAddresses: boolean
  selectedAddressId: string
  onSelectAddress: (id: string) => void
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: LookupState
  onTaxBusinessInfoChange: (info: TaxBusinessInfo | null) => void
  onTaxBusinessLookupStateChange: (state: LookupState) => void
}

export function StepPersonal({
  addresses,
  isLoadingAddresses,
  selectedAddressId,
  onSelectAddress,
  taxBusinessInfo,
  taxBusinessLookupState,
  onTaxBusinessInfoChange,
  onTaxBusinessLookupStateChange
}: StepPersonalProps) {
  const { t } = useTranslation()

  return (
    <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
      <header className='mb-4 border-b border-border/70 pb-4'>
        <h2 className='font-heading text-lg font-semibold'>{t('orders.checkout.stepPersonal')}</h2>
        <p className='mt-1 text-sm text-muted-foreground'>{t('orders.checkout.stepPersonalDescription')}</p>
      </header>

      {isLoadingAddresses ? (
        <div className='flex items-center justify-center py-12'>
          <Spinner />
        </div>
      ) : (
        <CheckoutFields
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={onSelectAddress}
          taxBusinessInfo={taxBusinessInfo}
          taxBusinessLookupState={taxBusinessLookupState}
          onTaxBusinessInfoChange={onTaxBusinessInfoChange}
          onTaxBusinessLookupStateChange={onTaxBusinessLookupStateChange}
        />
      )}
    </section>
  )
}
