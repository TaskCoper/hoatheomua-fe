import type { Address } from '@/features/addresses/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { CheckoutFormValues } from '../validations'

interface UseCheckoutAddressSelectionArgs {
  addresses: Address[]
  methods: UseFormReturn<CheckoutFormValues>
}

export const useCheckoutAddressSelection = ({ addresses, methods }: UseCheckoutAddressSelectionArgs) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const hasInitializedRef = useRef(false)

  const applyAddress = useCallback(
    (address: Address) => {
      methods.setValue('fullName', address.receiverName ?? '', { shouldDirty: true, shouldValidate: true })
      methods.setValue('phone', address.phoneNumber ?? '', { shouldDirty: true, shouldValidate: true })
      methods.setValue('addressLine', address.addressLine ?? '', { shouldDirty: true, shouldValidate: true })
      methods.setValue('city', address.city ?? '', { shouldDirty: true })
      methods.setValue('ward', address.ward ?? '', { shouldDirty: true })
      methods.setValue('latitude', address.latitude ?? 0, { shouldDirty: true })
      methods.setValue('longitude', address.longitude ?? 0, { shouldDirty: true })
      methods.setValue('mapId', address.mapId ?? '', { shouldDirty: true })
    },
    [methods]
  )

  useEffect(() => {
    if (hasInitializedRef.current || addresses.length === 0) return
    const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
    hasInitializedRef.current = true
    setSelectedAddressId(defaultAddress.id)
    applyAddress(defaultAddress)
  }, [addresses, applyAddress])

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id)
    if (!id) {
      methods.reset()
      return
    }
    const address = addresses.find((item) => item.id === id)
    if (address) applyAddress(address)
  }

  return { selectedAddressId, handleSelectAddress }
}
