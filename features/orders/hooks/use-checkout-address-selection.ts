import type { Address } from '@/features/addresses/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { CheckoutFormValues } from '../validations'

interface UseCheckoutAddressSelectionArgs {
  addresses: Address[]
  methods: UseFormReturn<CheckoutFormValues>
}

const EMPTY_ADDRESS_FIELDS = {
  addressLine: '',
  city: '',
  ward: '',
  cityCode: -1,
  wardCode: -1,
  latitude: 0,
  longitude: 0,
  mapId: ''
} as const

export const useCheckoutAddressSelection = ({ addresses, methods }: UseCheckoutAddressSelectionArgs) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const hasInitializedRef = useRef(false)

  const { setValue } = methods

  // Only the location half of an address is lifted into the form. `receiverName`
  // and `phoneNumber` stay on the address — the order's contact is the account.
  const applyAddress = useCallback(
    (address: Address) => {
      setValue('addressLine', address.addressLine ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('city', address.city ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('ward', address.ward ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('latitude', address.latitude ?? 0, { shouldDirty: true })
      setValue('longitude', address.longitude ?? 0, { shouldDirty: true })
      setValue('mapId', address.mapId ?? '', { shouldDirty: true })
    },
    [setValue]
  )

  const clearAddress = useCallback(() => {
    for (const [field, value] of Object.entries(EMPTY_ADDRESS_FIELDS)) {
      setValue(field as keyof typeof EMPTY_ADDRESS_FIELDS, value, { shouldDirty: true })
    }
  }, [setValue])

  useEffect(() => {
    if (hasInitializedRef.current || addresses.length === 0) return
    const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
    hasInitializedRef.current = true
    setSelectedAddressId(defaultAddress.id)
    applyAddress(defaultAddress)
  }, [addresses, applyAddress])

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id)
    const address = addresses.find((item) => item.id === id)
    if (address) applyAddress(address)
    else clearAddress()
  }

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  )

  return { selectedAddressId, selectedAddress, handleSelectAddress, clearAddress }
}
