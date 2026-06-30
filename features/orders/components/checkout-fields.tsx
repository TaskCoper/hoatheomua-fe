'use client'

import { DatePickerField } from '@/components/date-picker-field'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Address } from '@/features/addresses/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useEffect, useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { useGetLatLng } from '../hooks/use-get-lat-lng'
import { useGetShippingLocations } from '../hooks/use-get-shipping-locations'
import orderService, { pickBestGeocodeResult } from '../services'
import type { CheckoutFormValues } from '../validations'
import type { TaxBusinessInfo } from '../types'
import { LocationCombobox } from './location-combobox'

interface CheckoutFieldsProps {
  addresses: Address[]
  selectedAddressId: string
  onSelectAddress: (id: string) => void
  taxBusinessInfo: TaxBusinessInfo | null
  taxBusinessLookupState: 'idle' | 'loading' | 'found' | 'not_found' | 'error'
  onTaxBusinessInfoChange: (info: TaxBusinessInfo | null) => void
  onTaxBusinessLookupStateChange: (state: 'idle' | 'loading' | 'found' | 'not_found' | 'error') => void
}

export function CheckoutFields({
  addresses,
  selectedAddressId,
  onSelectAddress,
  taxBusinessInfo,
  taxBusinessLookupState,
  onTaxBusinessInfoChange,
  onTaxBusinessLookupStateChange
}: CheckoutFieldsProps) {
  const { t } = useTranslation()
  const { control, setValue, watch } = useFormContext<CheckoutFormValues>()

  const cityCodeForm = watch('cityCode')
  const wardCodeForm = watch('wardCode')
  const addressLineForm = watch('addressLine')
  const wardForm = watch('ward')
  const cityForm = watch('city')
  const taxCodeForm = watch('taxCode')

  const { shippingLocations: cities, isLoadingShippingLocations: isLoadingCities } = useGetShippingLocations({
    type: 'CITY'
  })
  const { shippingLocations: wards, isLoadingShippingLocations: isLoadingWards } = useGetShippingLocations({
    type: 'WARD',
    parentId: cityCodeForm,
    enabled: cityCodeForm !== -1
  })

  const fullAddress = addressLineForm && wardForm && cityForm ? `${addressLineForm}, ${wardForm}, ${cityForm}` : ''
  const [debouncedAddress] = useDebounce(fullAddress, 300)
  const [debouncedTaxCode] = useDebounce(taxCodeForm, 500)
  const hasTaxCodeEntered = !!debouncedTaxCode?.trim()

  const { latLng } = useGetLatLng({ address: debouncedAddress, enabled: !!debouncedAddress })

  useEffect(() => {
    if (!debouncedAddress) return
    const best = pickBestGeocodeResult(debouncedAddress, latLng)
    if (!best) return
    setValue('latitude', best.geometry.location.lat, { shouldDirty: true })
    setValue('longitude', best.geometry.location.lng, { shouldDirty: true })
    setValue('mapId', best.place_id, { shouldDirty: true })
  }, [latLng, debouncedAddress, setValue])

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

  useEffect(() => {
    const taxCode = debouncedTaxCode?.trim() ?? ''

    if (!taxCode) {
      onTaxBusinessInfoChange(null)
      onTaxBusinessLookupStateChange('idle')
      return
    }

    let cancelled = false

    onTaxBusinessLookupStateChange('loading')

    orderService
      .lookupTaxCode({ taxCode })
      .then((businessInfo) => {
        if (cancelled) return
        onTaxBusinessInfoChange(businessInfo)
        onTaxBusinessLookupStateChange(businessInfo ? 'found' : 'not_found')
      })
      .catch(() => {
        if (cancelled) return
        onTaxBusinessInfoChange(null)
        onTaxBusinessLookupStateChange('error')
      })

    return () => {
      cancelled = true
    }
  }, [debouncedTaxCode, onTaxBusinessInfoChange, onTaxBusinessLookupStateChange])

  const addressOptions = useMemo(
    () =>
      addresses.map((address) => ({
        label: `${address.receiverName} · ${address.addressLine}, ${address.ward}, ${address.city}`,
        value: address.id
      })),
    [addresses]
  )

  return (
    <FieldGroup className='gap-2'>
      {addresses.length > 0 ? (
        <Field className='gap-1 mb-4'>
          <FieldLabel>{t('orders.checkout.savedAddress')}</FieldLabel>
          <LocationCombobox
            value={selectedAddressId}
            onChange={onSelectAddress}
            options={addressOptions}
            placeholder={t('orders.checkout.savedAddressPlaceholder')}
            searchPlaceholder={t('orders.checkout.savedAddressSearchPlaceholder')}
            emptyMessage={t('orders.checkout.comboboxEmpty')}
          />
        </Field>
      ) : (
        <>
          <Controller
            name='fullName'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name}>{t('orders.checkout.fullName')}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='name'
                  placeholder={t('orders.checkout.fullNamePlaceholder')}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='phone'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name}>{t('orders.checkout.phone')}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type='tel'
                  inputMode='tel'
                  aria-invalid={fieldState.invalid}
                  autoComplete='tel'
                  placeholder={t('orders.checkout.phonePlaceholder')}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <Controller
            name='addressLine'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name}>{t('orders.checkout.addressLine')}</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete='off'
                  spellCheck={false}
                  placeholder={t('orders.checkout.addressLinePlaceholder')}
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

        </>
      )}

      <Controller
        name='taxCode'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('orders.checkout.taxCode')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete='off'
              spellCheck={false}
              placeholder={t('orders.checkout.taxCodePlaceholder')}
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
            {hasTaxCodeEntered ? (
              <div className='rounded-2xl border border-border/60 bg-muted/30 px-3 py-2 text-sm'>
                {taxBusinessLookupState === 'loading' ? (
                  <p className='text-muted-foreground'>{t('orders.checkout.taxBusinessLoading')}</p>
                ) : taxBusinessLookupState === 'found' && taxBusinessInfo ? (
                  <div className='grid gap-1'>
                    <p>
                      <span className='text-muted-foreground'>{t('orders.checkout.taxBusinessId')}:</span>{' '}
                      <span className='font-medium'>{taxBusinessInfo.id}</span>
                    </p>
                    <p>
                      <span className='text-muted-foreground'>{t('orders.checkout.taxBusinessName')}:</span>{' '}
                      <span className='font-medium'>{taxBusinessInfo.name}</span>
                    </p>
                    <p className='min-w-0 whitespace-normal wrap-break-words'>
                      <span className='text-muted-foreground'>{t('orders.checkout.taxBusinessAddress')}:</span>{' '}
                      <span className='font-medium'>{taxBusinessInfo.address}</span>
                    </p>
                  </div>
                ) : taxBusinessLookupState === 'error' ? (
                  <p className='text-destructive'>{t('orders.checkout.taxBusinessLookupError')}</p>
                ) : taxBusinessLookupState === 'not_found' ? (
                  <p className='text-muted-foreground'>{t('orders.checkout.taxBusinessNotFound')}</p>
                ) : null}
              </div>
            ) : null}
          </Field>
        )}
      />

      <DatePickerField<CheckoutFormValues>
        name='orderTime'
        label='orders.checkout.orderTime'
        placeholder='orders.checkout.orderTimePlaceholder'
        minDate={new Date(new Date().setHours(0, 0, 0, 0))}
        maxDate={new Date(new Date(new Date().setHours(23, 59, 59, 999)).getTime() + 7 * 24 * 60 * 60 * 1000)}
      />

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
    </FieldGroup>
  )
}
