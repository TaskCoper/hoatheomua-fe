'use client'

import { Spinner } from '@/components/ui/spinner'
import type { Address } from '@/features/addresses/types'
import { CheckoutFields } from '../checkout-fields'

interface StepPersonalProps {
  addresses: Address[]
  isLoadingAddresses: boolean
  selectedAddressId: string
  selectedAddress: Address | null
  onSelectAddress: (id: string) => void
  onClearAddress: () => void
  manualAddress: boolean
  onManualAddressChange: (value: boolean) => void
  onLoadingShippingLocationsChange?: (isLoading: boolean) => void
}

export function StepPersonal({
  addresses,
  isLoadingAddresses,
  selectedAddressId,
  selectedAddress,
  onSelectAddress,
  onClearAddress,
  manualAddress,
  onManualAddressChange,
  onLoadingShippingLocationsChange
}: StepPersonalProps) {
  if (isLoadingAddresses) {
    return (
      <section className='flex items-center justify-center rounded-3xl bg-card p-5 py-12 sm:p-6 border border-border'>
        <Spinner />
      </section>
    )
  }

  return (
    <CheckoutFields
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      selectedAddress={selectedAddress}
      onSelectAddress={onSelectAddress}
      onClearAddress={onClearAddress}
      manualAddress={manualAddress}
      onManualAddressChange={onManualAddressChange}
      onLoadingShippingLocationsChange={onLoadingShippingLocationsChange}
    />
  )
}
