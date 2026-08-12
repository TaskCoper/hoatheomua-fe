'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Address } from '@/features/addresses/types'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Calendar03Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useGetShippingLocations } from '../hooks/use-get-shipping-locations'
import { matchShippingLocation } from '../utils/match-shipping-location'
import type { CheckoutFormValues } from '../validations'
import { AddressAutocomplete } from './address-autocomplete'
import { AddressMapField } from './address-map-field'
import { LocationCombobox } from './location-combobox'
import { SavedAddressPicker } from './saved-address-picker'

const ORDER_TAG_NONE = '__none__'

interface CheckoutFieldsProps {
  addresses: Address[]
  selectedAddressId: string
  selectedAddress: Address | null
  onSelectAddress: (id: string) => void
  onClearAddress: () => void
  manualAddress: boolean
  onManualAddressChange: (value: boolean) => void
  onLoadingShippingLocationsChange?: (isLoading: boolean) => void
}

export function CheckoutFields({
  addresses,
  selectedAddressId,
  selectedAddress,
  onSelectAddress,
  onClearAddress,
  manualAddress,
  onManualAddressChange,
  onLoadingShippingLocationsChange
}: CheckoutFieldsProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const {
    control,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<CheckoutFormValues>()
  const phoneReceiverError = errors.phoneReceiver
  const [orderTimeOpen, setOrderTimeOpen] = useState(false)
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

  const { orderTags, isGettingOrderTags } = useGetOrderTags()

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
      setValue('ward', matchedWard.name, { shouldDirty: true })
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
            {phoneReceiverError ? <FieldError className='text-xs' errors={[phoneReceiverError]} /> : null}
          </>
        ) : null}

        {showManualFields ? (
          <>
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

            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Controller
                name='cityCode'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
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
                          setValue('city', cityName, { shouldDirty: true })
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
                      invalid={fieldState.invalid}
                    />
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name='wardCode'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
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
                          setValue('ward', wardName, { shouldDirty: true })
                        }
                      }}
                      options={wards.map((ward) => ({ label: ward.name, value: String(ward.id) }))}
                      placeholder={t('orders.checkout.wardPlaceholder')}
                      searchPlaceholder={t('orders.checkout.wardSearchPlaceholder')}
                      emptyMessage={t('orders.checkout.comboboxEmpty')}
                      disabled={isLoadingWards || wards.length === 0}
                      invalid={fieldState.invalid}
                    />
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />
            </div>

            <Controller
              name='addressLine'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.addressLine')}</FieldLabel>
                  <AddressAutocomplete
                    id={field.name}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    onResolve={({ latitude, longitude, mapId, ward, city }) => {
                      setValue('latitude', latitude, { shouldDirty: true })
                      setValue('longitude', longitude, { shouldDirty: true })
                      setValue('mapId', mapId, { shouldDirty: true })
                      // This resolved point becomes the anchor the map pin is
                      // constrained to; subsequent drags are measured from here.
                      setMapAnchor({ latitude, longitude })

                      // Lift the resolved ward/city into their own selectors.
                      const matchedCity = matchShippingLocation(cities, city)
                      const cityChanged = Boolean(matchedCity && matchedCity.id !== cityCodeForm)
                      if (cityChanged && matchedCity) {
                        setValue('city', matchedCity.name, { shouldDirty: true })
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
                    invalid={fieldState.invalid}
                  />
                  {/* <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div> */}
                </Field>
              )}
            />

            <AddressMapField
              latitude={latitudeForm}
              longitude={longitudeForm}
              onResolve={({ latitude, longitude, mapId, addressLine, ward, city }) => {
                // Sync every field to whatever the reverse geocode landed on:
                // coordinate, address line, and the city/ward selectors.
                setValue('latitude', latitude, { shouldDirty: true })
                setValue('longitude', longitude, { shouldDirty: true })
                setValue('mapId', mapId, { shouldDirty: true })
                if (addressLine) {
                  setValue('addressLine', addressLine, { shouldDirty: true })
                }

                // Lift the resolved ward/city into their own selectors.
                const matchedCity = matchShippingLocation(cities, city)
                const cityChanged = Boolean(matchedCity && matchedCity.id !== cityCodeForm)
                if (cityChanged && matchedCity) {
                  setValue('city', matchedCity.name, { shouldDirty: true })
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

      <CheckoutSection
        title={t('orders.checkout.deliveryOptionsHeading')}
        description={t('orders.checkout.deliveryOptionsDescription')}
      >
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
          <Controller
            name='orderTime'
            control={control}
            render={({ field, fieldState }) => {
              const selectedDate = field.value > 0 ? new Date(field.value * 1000) : undefined
              const displayDate = selectedDate ?? new Date()

              return (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name} className='gap-0.5'>
                    {t('orders.checkout.orderTime')}
                    <span className='text-xs text-muted-foreground'>({t('common.ui.optional')})</span>
                  </FieldLabel>

                  <Popover open={orderTimeOpen} onOpenChange={setOrderTimeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id={field.name}
                        variant='outline'
                        role='combobox'
                        aria-expanded={orderTimeOpen}
                        aria-invalid={fieldState.invalid}
                        className={cn(
                          'w-full justify-between px-3 text-left font-normal',
                          fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
                        )}
                      >
                        <span className='flex items-center gap-2 truncate'>
                          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className='size-4 opacity-50' />
                          {formatDate(displayDate, 'dateLong')}
                        </span>

                        {field.value > 0 && (
                          <div
                            role='button'
                            tabIndex={0}
                            className='cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground'
                            onClick={(e) => {
                              e.stopPropagation()
                              field.onChange(0)
                            }}
                          >
                            <HugeiconsIcon
                              icon={CancelCircleIcon}
                              strokeWidth={2}
                              className='size-4 opacity-50 hover:opacity-100'
                            />
                            <span className='sr-only'>{t('common.button.clear')}</span>
                          </div>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      sideOffset={8}
                      className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-auto overflow-y-auto p-0'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (!date) {
                            field.onChange(0)
                            setOrderTimeOpen(false)
                            return
                          }
                          const isToday = date.toDateString() === new Date().toDateString()
                          field.onChange(isToday ? 0 : Math.floor(date.getTime() / 1000))
                          setOrderTimeOpen(false)
                        }}
                        disabled={[{ before: minOrderDate }, { after: maxOrderDate }]}
                        startMonth={minOrderDate}
                        endMonth={maxOrderDate}
                        captionLayout='dropdown'
                        defaultMonth={displayDate}
                      />
                    </PopoverContent>
                  </Popover>

                  <div className='min-h-4'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )
            }}
          />

          <Controller
            name='tagIds'
            control={control}
            render={({ field, fieldState }) => {
              const selected = field.value?.[0]
              return (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name}>{t('orders.checkout.tag')}</FieldLabel>
                  <Select
                    value={selected !== undefined ? String(selected) : ORDER_TAG_NONE}
                    onValueChange={(value) => {
                      field.onChange(value === ORDER_TAG_NONE ? [] : [Number(value)])
                    }}
                    disabled={isGettingOrderTags || !orderTags?.options?.length}
                  >
                    <SelectTrigger id={field.name} className='w-full' aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder={t('orders.checkout.tagPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ORDER_TAG_NONE}>{t('orders.checkout.tagNone')}</SelectItem>
                      {orderTags?.options?.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className='min-h-4'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )
            }}
          />
        </div>

        <Controller
          name='remarks'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('orders.checkout.remarks')}</FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ''}
                id={field.name}
                aria-invalid={fieldState.invalid}
                rows={3}
                placeholder={t('orders.checkout.remarksPlaceholder')}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </CheckoutSection>
    </div>
  )
}

function CheckoutSection({
  title,
  description,
  action,
  children
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className='rounded-3xl bg-card p-5 sm:p-6 border border-border'>
      <header className='mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-4'>
        <div className='min-w-0'>
          <h2 className='font-title font-semibold'>{title}</h2>
          <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
        {action}
      </header>
      <div className='space-y-3'>{children}</div>
    </section>
  )
}
