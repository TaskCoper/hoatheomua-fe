'use client'

import { Skeleton } from '@/components/ui/skeleton'
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
      <section className='space-y-4 rounded-3xl bg-card p-5 sm:p-6 border border-border'>
        <Skeleton className='h-6 w-40 rounded-md' />
        <div className='space-y-3'>
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className='h-20 w-full rounded-2xl' />
          ))}
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='h-11 w-full rounded-xl' />
          ))}
        </div>
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
