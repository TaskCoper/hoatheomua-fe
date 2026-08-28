import type { Address } from '@/features/addresses/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { CheckoutFormValues } from '../validations'

interface UseCheckoutAddressSelectionArgs {
  addresses: Address[]
  methods: UseFormReturn<CheckoutFormValues>
  manualAddress: boolean
  onSelectedAddressRevised?: () => void
}

const EMPTY_ADDRESS_FIELDS = {
  fullNameReceiver: '',
  phoneReceiver: '',
  addressLine: '',
  city: '',
  ward: '',
  cityCode: -1,
  wardCode: -1,
  latitude: 0,
  longitude: 0,
  mapId: ''
} as const

// The saved-address fields the checkout form mirrors. Editing the address
// elsewhere (the profile sheet) refetches the list, so a snapshot mismatch is
// what tells us the form is now showing stale data.
const addressSnapshot = (address: Address) =>
  JSON.stringify([
    address.receiverName,
    address.phoneNumber,
    address.addressLine,
    address.city,
    address.ward,
    address.latitude,
    address.longitude,
    address.mapId
  ])

export const useCheckoutAddressSelection = ({
  addresses,
  methods,
  manualAddress,
  onSelectedAddressRevised
}: UseCheckoutAddressSelectionArgs) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const appliedSnapshotRef = useRef<string | null>(null)

  const { setValue } = methods

  const applyAddress = useCallback(
    (address: Address) => {
      setValue('fullNameReceiver', address.receiverName ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('phoneReceiver', address.phoneNumber ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('addressLine', address.addressLine ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('city', address.city ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('ward', address.ward ?? '', { shouldDirty: true, shouldValidate: true })
      setValue('latitude', address.latitude ?? 0, { shouldDirty: true })
      setValue('longitude', address.longitude ?? 0, { shouldDirty: true })
      setValue('mapId', address.mapId ?? '', { shouldDirty: true })
      appliedSnapshotRef.current = addressSnapshot(address)
    },
    [setValue]
  )

  const clearAddress = useCallback(() => {
    for (const [field, value] of Object.entries(EMPTY_ADDRESS_FIELDS)) {
      setValue(field as keyof typeof EMPTY_ADDRESS_FIELDS, value, { shouldDirty: true })
    }
    appliedSnapshotRef.current = null
  }, [setValue])

  // Nothing picked yet - or the pick was deleted elsewhere - falls back to the
  // default address, so the selection never points at something that is gone.
  const selectedAddress = useMemo(() => {
    const picked = addresses.find((address) => address.id === selectedAddressId)
    if (picked) {
      return picked
    }

    return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null
  }, [addresses, selectedAddressId])

  // Read through a ref so a caller that re-creates the callback every render
  // doesn't re-run the sync effect below.
  const onRevisedRef = useRef(onSelectedAddressRevised)
  useEffect(() => {
    onRevisedRef.current = onSelectedAddressRevised
  })

  // Mirror the selected address into the form - on first selection and again
  // whenever that address is edited elsewhere. Manual entry is skipped: those
  // fields belong to the user, not to a saved address.
  useEffect(() => {
    if (manualAddress || !selectedAddress) {
      return
    }

    if (addressSnapshot(selectedAddress) === appliedSnapshotRef.current) {
      return
    }

    const isRevision = appliedSnapshotRef.current !== null
    applyAddress(selectedAddress)

    if (isRevision) {
      onRevisedRef.current?.()
    }
  }, [manualAddress, selectedAddress, applyAddress])

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id)
    const address = addresses.find((item) => item.id === id)
    if (address) applyAddress(address)
    else clearAddress()
  }

  return { selectedAddressId: selectedAddress?.id ?? '', selectedAddress, handleSelectAddress, clearAddress }
}
