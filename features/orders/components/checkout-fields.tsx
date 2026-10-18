'use client'

import { DatePickerField } from '@/components/date-picker-field'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Address } from '@/features/addresses/types'
import { useGetDeliverySlotAvailability } from '@/hooks/use-get-delivery-slot-availability'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Calendar03Icon, DeliveryTruck02Icon, LocationUser01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import type { CheckoutDeliveryOption } from '../checkout-methods'
import { useGetShippingLocations } from '../hooks/use-get-shipping-locations'
import { countWords, truncateWords } from '../cards/card-config'
import { toOrderTimestamp } from '../payloads'
import { matchShippingLocation } from '../utils/match-shipping-location'
import { cn } from '@/shared/utils'
import type { DeliverySlot } from '@/types/config.type'
import { ORDER_REMARKS_MAX_WORDS, type CheckoutFormValues } from '../validations'
import { AddressAutocomplete } from './address-autocomplete'
import { AddressMapField } from './address-map-field'
import CheckoutSection from './checkout/checkout-section'
import DeliveryMethodPicker from './checkout/delivery-method-picker'
import { LocationCombobox } from './location-combobox'
import { SavedAddressPicker } from './saved-address-picker'

// Slots are published as "17h - 19h" (minutes optional, e.g. "17h30 - 19h").
// Anything that does not parse has no time we can trust, so it is dropped
// rather than offered as a window we cannot check against the clock.
const slotEndMinutes = (label: string) => {
  const match = label.match(/^\s*\d{1,2}h(?:\d{1,2})?\s*[-–—]\s*(\d{1,2})h(\d{1,2})?\s*$/)
  if (!match) return null

  return Number(match[1]) * 60 + Number(match[2] ?? 0)
}

const slotStartMinutes = (label: string) => {
  const match = label.match(/^\s*(\d{1,2})h(\d{1,2})?\s*-/)
  if (!match) return null

  return Number(match[1]) * 60 + Number(match[2] ?? 0)
}

// A same-day order needs four hours to prepare, counted from the end of the window running now
// (or from now itself, between windows) - so 11h, inside "10h - 12h", opens windows from 16h.
const SLOT_LEAD_MINUTES = 4 * 60

const getEarliestSlotStartMinutes = (slots: DeliverySlot[], minutesNow: number) => {
  const runningSlotEnd = slots
    .map((slot) => ({ startMinutes: slotStartMinutes(slot.label), endMinutes: slotEndMinutes(slot.label) }))
    .find(
      ({ startMinutes, endMinutes }) =>
        startMinutes !== null && endMinutes !== null && startMinutes <= minutesNow && minutesNow < endMinutes
    )?.endMinutes

  return (runningSlotEnd ?? minutesNow) + SLOT_LEAD_MINUTES
}

const getSlotRemaining = (slot: DeliverySlot) => Math.max(0, slot.limit - Math.max(0, slot.occupied))

const isSlotSelectable = (slot: DeliverySlot) => {
  const remaining = getSlotRemaining(slot)
  return remaining > 0
}

interface CheckoutFieldsProps {
  addresses: Address[]
  selectedAddressId: string
  selectedAddress: Address | null
  onSelectAddress: (id: string) => void
  onClearAddress: () => void
  manualAddress: boolean
  onManualAddressChange: (value: boolean) => void
  onLoadingShippingLocationsChange?: (isLoading: boolean) => void
  deliveryMethods: CheckoutDeliveryOption[]
  selectedDeliveryMethodId: string
  onSelectDeliveryMethod: (id: string) => void
}

export default function CheckoutFields({
  addresses,
  selectedAddressId,
  selectedAddress,
  onSelectAddress,
  onClearAddress,
  manualAddress,
  onManualAddressChange,
  onLoadingShippingLocationsChange,
  deliveryMethods,
  selectedDeliveryMethodId,
  onSelectDeliveryMethod
}: CheckoutFieldsProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const {
    control,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<CheckoutFormValues>()
  const fullNameReceiverError = errors.fullNameReceiver
  const phoneReceiverError = errors.phoneReceiver
  // The schema reports a missing city/ward on the name fields, but the pickers are bound to
  // the codes - so both are read, or a "required" error would have nowhere to show.
  const cityError = errors.cityCode ?? errors.city
  const wardError = errors.wardCode ?? errors.ward
  const locationError = errors.latitude ?? errors.longitude
  const addressLineError = errors.addressLine ?? locationError
  // A saved address fills every field at once, so whichever part is unusable is reported in one place.
  const savedAddressError = errors.addressLine ?? errors.city ?? errors.ward ?? locationError
  // The coordinate the typed address resolved to - map picks are constrained to
  // a radius around it so the pin can be fine-tuned but not moved to a new area.
  const [mapAnchor, setMapAnchor] = useState<{ latitude: number; longitude: number } | null>(null)

  const minOrderDate = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), [])
  const maxOrderDate = useMemo(
    () => new Date(new Date(new Date().setHours(23, 59, 59, 999)).getTime() + 7 * 24 * 60 * 60 * 1000),
    []
  )

  const cityCodeForm = watch('cityCode')
  const wardCodeForm = watch('wardCode')
  const wardForm = watch('ward')
  const cityForm = watch('city')
  const latitudeForm = watch('latitude')
  const longitudeForm = watch('longitude')

  const hasSavedAddresses = addresses.length > 0
  const showManualFields = manualAddress || !hasSavedAddresses

  // The anchor belongs to a typed address. Once a saved one takes over it is stale, however the
  // switch happened - the toggle below, or a toast's one-click fallback from the page.
  const [wasManual, setWasManual] = useState(showManualFields)
  if (wasManual !== showManualFields) {
    setWasManual(showManualFields)
    if (!showManualFields) setMapAnchor(null)
  }

  const handleManualToggle = (checked: boolean) => {
    onManualAddressChange(checked)
    if (checked) {
      // Blank the address fields so the user starts a fresh manual entry.
      onClearAddress()
      setMapAnchor(null)
    } else if (selectedAddressId) {
      // Restore the previously selected saved address.
      onSelectAddress(selectedAddressId)
    }
  }

  const orderTimeForm = watch('orderTime')
  const selectedTagId = watch('tagIds')?.[0]
  const hasDeliverySlot = selectedTagId !== undefined
  const isScheduledDate = toOrderTimestamp(orderTimeForm) !== 0
  const effectiveOrderDate = useMemo(
    () => (orderTimeForm ? new Date(orderTimeForm) : minOrderDate),
    [orderTimeForm, minOrderDate]
  )
  const {
    slots: deliverySlots,
    isGettingDeliverySlotAvailability,
    isDeliverySlotAvailabilityError
  } = useGetDeliverySlotAvailability(effectiveOrderDate)

  // Only today is held back by the preparation lead time - a later date keeps every
  // slot. Availability and limits come from the user-facing availability API.
  const tagOptions = useMemo(() => {
    const now = new Date()
    const orderDate = orderTimeForm ? new Date(orderTimeForm) : minOrderDate
    const isToday = orderDate.toDateString() === now.toDateString()
    const earliestStartMinutes = getEarliestSlotStartMinutes(deliverySlots, now.getHours() * 60 + now.getMinutes())

    return deliverySlots.filter((slot) => {
      if (slotEndMinutes(slot.label) === null) return false
      if (!isToday) return true

      const startMinutes = slotStartMinutes(slot.label)
      return startMinutes !== null && startMinutes >= earliestStartMinutes
    })
  }, [deliverySlots, orderTimeForm, minOrderDate])

  useEffect(() => {
    if (selectedTagId !== undefined || isGettingDeliverySlotAvailability || isDeliverySlotAvailabilityError) return

    if (effectiveOrderDate.toDateString() !== new Date().toDateString()) return

    // `tagOptions` already starts after the lead time, so the earliest open window is the pick.
    const autoSelectedSlot = tagOptions
      .filter((slot) => isSlotSelectable(slot))
      .map((slot) => ({ slot, startMinutes: slotStartMinutes(slot.label) }))
      .filter((item): item is { slot: DeliverySlot; startMinutes: number } => item.startMinutes !== null)
      .sort((a, b) => a.startMinutes - b.startMinutes)[0]?.slot

    if (autoSelectedSlot) {
      setValue('tagIds', [autoSelectedSlot.tagId], { shouldDirty: false, shouldValidate: true })
    }
  }, [
    selectedTagId,
    isGettingDeliverySlotAvailability,
    isDeliverySlotAvailabilityError,
    effectiveOrderDate,
    tagOptions,
    setValue
  ])

  // A slot can fall out of the list when the date moves back to today, so the
  // picked one never survives as a window that already passed.
  useEffect(() => {
    if (selectedTagId === undefined || isGettingDeliverySlotAvailability || isDeliverySlotAvailabilityError) return
    const selectedSlot = deliverySlots.find((slot) => slot.tagId === selectedTagId)
    if (selectedSlot && tagOptions.some((slot) => slot.tagId === selectedTagId) && isSlotSelectable(selectedSlot)) return

    setValue('tagIds', [], { shouldDirty: true, shouldValidate: true })
  }, [
    selectedTagId,
    deliverySlots,
    tagOptions,
    isGettingDeliverySlotAvailability,
    isDeliverySlotAvailabilityError,
    setValue
  ])

  const selectedTagLabel = deliverySlots.find((slot) => slot.tagId === selectedTagId)?.label
  const deliveryTimingLabel = hasDeliverySlot
    ? isScheduledDate
      ? t('orders.checkout.tagWithDate', {
          date: formatDate(orderTimeForm, 'dateLong'),
          tag: selectedTagLabel ?? t('orders.checkout.tag')
        })
      : (selectedTagLabel ?? t('orders.checkout.tag'))
    : t('orders.checkout.tagWithinDate', { date: formatDate(effectiveOrderDate, 'dateLong') })

  const { shippingLocations: cities, isLoadingShippingLocations: isLoadingCities } = useGetShippingLocations({
    type: 'CITY',
    enabled: showManualFields
  })
  const { shippingLocations: wards, isLoadingShippingLocations: isLoadingWards } = useGetShippingLocations({
    type: 'WARD',
    parentId: cityCodeForm,
    enabled: showManualFields && cityCodeForm !== -1
  })

  useEffect(() => {
    onLoadingShippingLocationsChange?.(isLoadingCities || isLoadingWards)
  }, [isLoadingCities, isLoadingWards, onLoadingShippingLocationsChange])

  useEffect(() => {
    return () => onLoadingShippingLocationsChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!cityForm || cities.length === 0) return
    const match = cities.find((city) => city.name === cityForm)
    if (match && match.id !== cityCodeForm) {
      setValue('cityCode', match.id, { shouldDirty: true, shouldValidate: true })
    }
  }, [cityForm, cities, cityCodeForm, setValue])

  useEffect(() => {
    if (!wardForm || wards.length === 0) return
    const match = wards.find((ward) => ward.name === wardForm)
    if (match && match.id !== wardCodeForm) {
      setValue('wardCode', match.id, { shouldDirty: true, shouldValidate: true })
    }
  }, [wardForm, wards, wardCodeForm, setValue])

  // Ward name lifted from a picked address, resolved to a selector option once
  // the newly-set city's ward list has finished loading.
  const pendingWardRef = useRef<string | null>(null)
  const resolvePendingWard = useCallback(() => {
    if (pendingWardRef.current === null || isLoadingWards || wards.length === 0) return
    const matchedWard = matchShippingLocation(wards, pendingWardRef.current)
    if (matchedWard) {
      setValue('ward', matchedWard.name, { shouldDirty: true, shouldValidate: true })
      setValue('wardCode', matchedWard.id, { shouldDirty: true, shouldValidate: true })
    }
    pendingWardRef.current = null
  }, [wards, isLoadingWards, setValue])

  useEffect(() => {
    resolvePendingWard()
  }, [resolvePendingWard])

  return (
    <div className='flex flex-col gap-2'>
      <CheckoutSection
        icon={LocationUser01Icon}
        title={t('orders.checkout.deliveryHeading')}
        description={t('orders.checkout.deliveryDescription')}
        action={
          hasSavedAddresses ? (
            <Button
              type='button'
              variant='link'
              size='sm'
              className='h-auto shrink-0 p-0 text-xs'
              onClick={() => handleManualToggle(!manualAddress)}
            >
              {manualAddress ? t('orders.checkout.useSavedAddress') : t('orders.checkout.manualAddress')}
            </Button>
          ) : null
        }
      >
        {!showManualFields ? (
          <>
            <SavedAddressPicker addresses={addresses} selectedAddress={selectedAddress} onSelect={onSelectAddress} />
            {fullNameReceiverError ? <FieldError className='text-xs' errors={[fullNameReceiverError]} /> : null}
            {phoneReceiverError ? <FieldError className='text-xs' errors={[phoneReceiverError]} /> : null}
            {savedAddressError ? <FieldError className='text-xs' errors={[savedAddressError]} /> : null}
          </>
        ) : null}

        {showManualFields ? (
          <>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Controller
                name='fullNameReceiver'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t('orders.checkout.fullNameReceiver')}</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id={field.name}
                      autoComplete='name'
                      maxLength={100}
                      aria-invalid={fieldState.invalid}
                      placeholder={t('orders.checkout.fullNamePlaceholder')}
                    />
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name='phoneReceiver'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t('orders.checkout.phoneReceiver')}</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id={field.name}
                      type='tel'
                      inputMode='tel'
                      autoComplete='tel'
                      maxLength={11}
                      aria-invalid={fieldState.invalid}
                      placeholder={t('orders.checkout.phonePlaceholder')}
                    />
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Controller
                name='cityCode'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!cityError} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t('orders.checkout.city')}</FieldLabel>
                    <LocationCombobox
                      value={field.value === -1 ? '' : String(field.value)}
                      onChange={(value) => {
                        if (value === '') {
                          setValue('cityCode', -1, { shouldDirty: true, shouldValidate: true })
                          setValue('wardCode', -1, { shouldDirty: true, shouldValidate: true })
                          setValue('ward', '', { shouldDirty: true })
                          setValue('city', '', { shouldDirty: true })
                          return
                        }

                        const newCityId = Number(value)
                        setValue('cityCode', newCityId, { shouldDirty: true, shouldValidate: true })

                        const cityName = cities.find((city) => city.id === newCityId)?.name
                        if (cityName) {
                          setValue('city', cityName, { shouldDirty: true, shouldValidate: true })
                        }

                        if (newCityId !== cityCodeForm) {
                          setValue('wardCode', -1, { shouldDirty: true, shouldValidate: true })
                          setValue('ward', '', { shouldDirty: true })
                        }
                      }}
                      options={cities.map((city) => ({ label: city.name, value: String(city.id) }))}
                      placeholder={t('orders.checkout.cityPlaceholder')}
                      searchPlaceholder={t('orders.checkout.citySearchPlaceholder')}
                      emptyMessage={t('orders.checkout.comboboxEmpty')}
                      disabled={isLoadingCities || cities.length === 0}
                      invalid={!!cityError}
                    />
                    <div className='min-h-4'>
                      {cityError && <FieldError className='text-xs' errors={[cityError]} />}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name='wardCode'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!wardError} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t('orders.checkout.ward')}</FieldLabel>
                    <LocationCombobox
                      value={field.value === -1 ? '' : String(field.value)}
                      onChange={(value) => {
                        if (value === '') {
                          setValue('wardCode', -1, { shouldDirty: true, shouldValidate: true })
                          setValue('ward', '', { shouldDirty: true })
                          return
                        }

                        const newWardId = Number(value)
                        setValue('wardCode', newWardId, { shouldDirty: true, shouldValidate: true })

                        const wardName = wards.find((ward) => ward.id === newWardId)?.name
                        if (wardName) {
                          setValue('ward', wardName, { shouldDirty: true, shouldValidate: true })
                        }
                      }}
                      options={wards.map((ward) => ({ label: ward.name, value: String(ward.id) }))}
                      placeholder={t('orders.checkout.wardPlaceholder')}
                      searchPlaceholder={t('orders.checkout.wardSearchPlaceholder')}
                      emptyMessage={t('orders.checkout.comboboxEmpty')}
                      disabled={isLoadingWards || wards.length === 0}
                      invalid={!!wardError}
                    />
                    <div className='min-h-4'>
                      {wardError && <FieldError className='text-xs' errors={[wardError]} />}
                    </div>
                  </Field>
                )}
              />
            </div>

            <Controller
              name='addressLine'
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!addressLineError} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.addressLine')}</FieldLabel>
                  <AddressAutocomplete
                    id={field.name}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    onResolve={({ latitude, longitude, mapId, ward, city }) => {
                      setValue('latitude', latitude, { shouldDirty: true, shouldValidate: true })
                      setValue('longitude', longitude, { shouldDirty: true, shouldValidate: true })
                      setValue('mapId', mapId, { shouldDirty: true })
                      // This resolved point becomes the anchor the map pin is
                      // constrained to; subsequent drags are measured from here.
                      setMapAnchor({ latitude, longitude })

                      // Lift the resolved ward/city into their own selectors.
                      const matchedCity = matchShippingLocation(cities, city)
                      const cityChanged = Boolean(matchedCity && matchedCity.id !== cityCodeForm)
                      if (cityChanged && matchedCity) {
                        setValue('city', matchedCity.name, { shouldDirty: true, shouldValidate: true })
                        setValue('cityCode', matchedCity.id, { shouldDirty: true, shouldValidate: true })
                        setValue('ward', '', { shouldDirty: true })
                        setValue('wardCode', -1, { shouldDirty: true, shouldValidate: true })
                      }
                      pendingWardRef.current = ward || null
                      // Same city → its ward list is already loaded, resolve now;
                      // a changed city resolves via the effect once wards reload.
                      if (!cityChanged) resolvePendingWard()
                    }}
                    onClear={() => {
                      setValue('latitude', 0, { shouldDirty: true })
                      setValue('longitude', 0, { shouldDirty: true })
                      setValue('mapId', '', { shouldDirty: true })
                      setMapAnchor(null)
                    }}
                    ward={wardForm ?? ''}
                    city={cityForm ?? ''}
                    placeholder={t('orders.checkout.addressLinePlaceholder')}
                    searchingLabel={t('orders.checkout.addressLineSearching')}
                    emptyLabel={t('orders.checkout.addressLineEmpty')}
                    invalid={!!addressLineError}
                  />
                  {addressLineError ? <FieldError className='text-xs' errors={[addressLineError]} /> : null}
                </Field>
              )}
            />

            <AddressMapField
              latitude={latitudeForm}
              longitude={longitudeForm}
              onResolve={({ latitude, longitude, mapId, addressLine, ward, city }) => {
                // Sync every field to whatever the reverse geocode landed on:
                // coordinate, address line, and the city/ward selectors.
                setValue('latitude', latitude, { shouldDirty: true, shouldValidate: true })
                setValue('longitude', longitude, { shouldDirty: true, shouldValidate: true })
                setValue('mapId', mapId, { shouldDirty: true })
                if (addressLine) {
                  setValue('addressLine', addressLine, { shouldDirty: true, shouldValidate: true })
                }

                // Lift the resolved ward/city into their own selectors.
                const matchedCity = matchShippingLocation(cities, city)
                const cityChanged = Boolean(matchedCity && matchedCity.id !== cityCodeForm)
                if (cityChanged && matchedCity) {
                  setValue('city', matchedCity.name, { shouldDirty: true, shouldValidate: true })
                  setValue('cityCode', matchedCity.id, { shouldDirty: true, shouldValidate: true })
                  setValue('ward', '', { shouldDirty: true })
                  setValue('wardCode', -1, { shouldDirty: true, shouldValidate: true })
                }
                pendingWardRef.current = ward || null
                // Same city → its ward list is already loaded, resolve now;
                // a changed city resolves via the effect once wards reload.
                if (!cityChanged) resolvePendingWard()
              }}
              anchorLatitude={mapAnchor?.latitude}
              anchorLongitude={mapAnchor?.longitude}
              hint={t('orders.checkout.mapHint')}
              useLocationLabel={t('orders.checkout.mapUseLocation')}
              resolvingLabel={t('orders.checkout.mapResolving')}
              locationErrorLabel={t('orders.checkout.mapLocationError')}
              tooFarLabel={t('orders.checkout.mapTooFar')}
            />
          </>
        ) : null}
      </CheckoutSection>

      <DeliveryMethodPicker
        methods={deliveryMethods}
        selectedId={selectedDeliveryMethodId}
        onSelect={onSelectDeliveryMethod}
      />

      <CheckoutSection
        icon={Calendar03Icon}
        title={t('orders.checkout.deliveryOptionsHeading')}
        description={t('orders.checkout.deliveryOptionsDescription')}
      >
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
          <DatePickerField<CheckoutFormValues>
            name='orderTime'
            control={control}
            label='orders.checkout.orderTime'
            placeholder='orders.checkout.orderTimePlaceholder'
            minDate={minOrderDate}
            maxDate={maxOrderDate}
            showOptionalHint={false}
            displayError={false}
            emptyValueDate={minOrderDate}
          />

          <Controller
            name='tagIds'
            control={control}
            render={({ field, fieldState }) => {
              const selected = field.value?.[0]
              return (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.tagLabel')}</FieldLabel>
                  <Select
                    value={selected !== undefined ? String(selected) : undefined}
                    onValueChange={(value) => {
                      field.onChange([Number(value)])
                    }}
                    disabled={isGettingDeliverySlotAvailability || !tagOptions.length}
                  >
                    <SelectTrigger id={field.name} className='w-full' aria-invalid={fieldState.invalid}>
                      {isGettingDeliverySlotAvailability || tagOptions.length ? (
                        <SelectValue placeholder={t('orders.checkout.tagPlaceholder')} />
                      ) : (
                        <span className='text-muted-foreground'>{t('orders.checkout.tagEmpty')}</span>
                      )}
                    </SelectTrigger>
                    <SelectContent position='popper'>
                      {tagOptions.map((slot) => {
                        const remaining = getSlotRemaining(slot)
                        const isAvailable = isSlotSelectable(slot)

                        return (
                          <SelectItem
                            key={slot.tagId}
                            value={String(slot.tagId)}
                            disabled={!isAvailable}
                            textValue={slot.label}
                            className='*:last:w-full'
                          >
                            <span className='flex w-full items-center gap-4 pr-1'>
                              <span className='min-w-0 flex-1 truncate'>{slot.label}</span>
                              <span
                                className={cn(
                                  'ml-auto shrink-0 text-right text-xs',
                                  !isAvailable ? 'text-muted-foreground/60' : 'text-muted-foreground'
                                )}
                              >
                                {remaining === 0 ? t('orders.checkout.slot.full') : null}
                              </span>
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? <FieldError className='text-xs' errors={[fieldState.error]} /> : null}
                </Field>
              )
            }}
          />
        </div>

        <DeliveryTimingNote label={deliveryTimingLabel} />

        <Controller
          name='remarks'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('orders.checkout.remarks')}</FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(truncateWords(event.target.value, ORDER_REMARKS_MAX_WORDS))}
                id={field.name}
                aria-invalid={fieldState.invalid}
                rows={3}
                placeholder={t('orders.checkout.remarksPlaceholder')}
              />
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
                <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                  {t('orders.checkout.cards.messageWordCount', {
                    count: countWords(field.value ?? ''),
                    max: ORDER_REMARKS_MAX_WORDS
                  })}
                </span>
              </div>
            </Field>
          )}
        />
      </CheckoutSection>
    </div>
  )
}

function DeliveryTimingNote({ label }: { label: string }) {
  const { t } = useTranslation()

  return (
    <div className='flex items-start gap-3 rounded-2xl border border-border bg-secondary/20 px-3 py-2.5'>
      <span className='grid size-8 shrink-0 place-items-center rounded-full bg-secondary/60 text-primary'>
        <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={1.75} className='size-4' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-medium text-muted-foreground'>{t('orders.checkout.deliveryNoteHeading')}</p>
        <p className='text-sm font-semibold text-foreground'>{label}</p>
      </div>
    </div>
  )
}
