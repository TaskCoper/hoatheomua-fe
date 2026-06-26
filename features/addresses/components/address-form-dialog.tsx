'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Address } from '../types'
import { useCreateAddress } from '../hooks/use-create-address'
import { useGetAddress } from '../hooks/use-get-address'
import { useGetShippingLocations } from '@/features/orders/hooks/use-get-shipping-locations'
import { useUpdateAddress } from '../hooks/use-update-address'
import { createAddressSchema, type AddressFormValues } from '../validations'

const defaultValues: AddressFormValues = {
  receiverName: '',
  phoneNumber: '',
  addressLine: '',
  ward: '',
  city: '',
  country: '',
  mapId: '',
  latitude: 0,
  longitude: 0,
  isDefault: false,
}

interface AddressFormDialogProps {
  trigger?: React.ReactNode
  address?: Address
  addressId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddressFormDialog({ trigger, address, addressId, open: openProp, onOpenChange }: AddressFormDialogProps) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const isEditMode = Boolean(addressId || address?.id)
  const schema = useMemo(() => createAddressSchema(t), [t])
  const { createAddress, isCreatingAddress } = useCreateAddress()
  const { updateAddress, isUpdatingAddress } = useUpdateAddress()
  const { address: fetchedAddress, isLoading: isLoadingAddress } = useGetAddress(addressId, open && isEditMode)

  const activeAddress = isEditMode ? (fetchedAddress ?? address) : undefined

  const methods = useForm<AddressFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  })

  const cityValue = useWatch({ control: methods.control, name: 'city' }) ?? ''
  const selectedCity = useMemo(() => cityValue.trim(), [cityValue])
  const { shippingLocations: cities, isLoadingShippingLocations: isLoadingCities } = useGetShippingLocations({
    type: 'CITY',
  })
  const selectedCityId = useMemo(() => {
    if (!selectedCity) return -1
    return cities.find((city) => city.name === selectedCity)?.id ?? -1
  }, [cities, selectedCity])
  const { shippingLocations: wards, isLoadingShippingLocations: isLoadingWards } = useGetShippingLocations({
    type: 'WARD',
    parentId: selectedCityId,
    enabled: selectedCityId !== -1,
  })

  useEffect(() => {
      if (!open) return

      methods.reset(
      activeAddress
        ? {
            receiverName: activeAddress.receiverName ?? '',
            phoneNumber: activeAddress.phoneNumber ?? '',
            addressLine: activeAddress.addressLine ?? '',
            ward: activeAddress.ward ?? '',
            city: activeAddress.city ?? '',
            country: activeAddress.country ?? '',
            mapId: activeAddress.mapId ?? '',
            latitude: activeAddress.latitude ?? 0,
            longitude: activeAddress.longitude ?? 0,
            isDefault: activeAddress.isDefault ?? false,
          }
        : defaultValues
    )
  }, [activeAddress, methods, open])

  const close = () => {
    setOpen(false)
    methods.reset(defaultValues)
  }

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      if (isEditMode && activeAddress?.id) {
        await updateAddress({ id: activeAddress.id, body: values })
        toast.success(t('profile.addressUpdated'))
      } else {
        await createAddress(values)
        toast.success(t('profile.addressCreated'))
      }
      close()
    } catch (error) {
      toast.error(t('error.somethingWentWrong'), {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  })

  const isPending = isCreatingAddress || isUpdatingAddress || (isEditMode && isLoadingAddress)
  const title = isEditMode ? t('profile.editAddress') : t('profile.addAddress')
  const description = isEditMode ? t('profile.editAddressDescription') : t('profile.addAddressDescription')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        position='top-center'
        className='overflow-hidden p-0 sm:max-w-2xl'
        showCloseButton
      >
        <div className='flex max-h-[calc(100vh-2rem)] flex-col'>
          <DialogHeader className='border-b px-5 pb-4 pt-5'>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <form className='flex min-h-0 flex-1 flex-col' onSubmit={onSubmit}>
            <div className='no-scrollbar flex-1 overflow-y-auto px-5 py-4'>
              <FieldGroup className='gap-3'>
                <Controller
                  name='receiverName'
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                      <FieldLabel htmlFor={field.name}>{t('profile.addressReceiverName')}</FieldLabel>
                      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                      <div className='min-h-4'>
                        {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />

                <Controller
                  name='phoneNumber'
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                      <FieldLabel htmlFor={field.name}>{t('profile.addressPhoneNumber')}</FieldLabel>
                      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                      <div className='min-h-4'>
                        {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />

                <Controller
                  name='addressLine'
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                      <FieldLabel htmlFor={field.name}>{t('profile.addressLine')}</FieldLabel>
                      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                      <div className='min-h-4'>
                        {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />

                <div className='grid gap-3 md:grid-cols-2'>
                  <Controller
                    name='ward'
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                        <FieldLabel htmlFor={field.name}>{t('profile.addressWard')}</FieldLabel>
                        <LocationCombobox
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          options={wards.map((ward) => ({ label: ward.name, value: ward.name }))}
                          placeholder={t('orders.checkout.wardPlaceholder')}
                          searchPlaceholder={t('orders.checkout.wardSearchPlaceholder')}
                          emptyMessage={t('orders.checkout.comboboxEmpty')}
                          disabled={isLoadingWards || wards.length === 0 || !selectedCity}
                          invalid={fieldState.invalid}
                        />
                        <div className='min-h-4'>
                          {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                        </div>
                      </Field>
                    )}
                  />
                  <Controller
                    name='city'
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                        <FieldLabel htmlFor={field.name}>{t('profile.addressCity')}</FieldLabel>
                        <LocationCombobox
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value)
                            methods.setValue('ward', '', { shouldDirty: true, shouldValidate: true })
                          }}
                          options={cities.map((city) => ({ label: city.name, value: city.name }))}
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
                </div>

                <Controller
                  name='country'
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                      <FieldLabel htmlFor={field.name}>{t('profile.addressCountry')}</FieldLabel>
                      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                      <div className='min-h-4'>
                        {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />

                <Controller
                  name='mapId'
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                      <FieldLabel htmlFor={field.name}>{t('profile.addressMapId')}</FieldLabel>
                      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                      <div className='min-h-4'>
                        {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />

                <div className='grid gap-3 md:grid-cols-2'>
                  <Controller
                    name='latitude'
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                        <FieldLabel htmlFor={field.name}>{t('profile.addressLatitude')}</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          type='number'
                          step='any'
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value === '' ? 0 : Number(event.target.value))}
                        />
                        <div className='min-h-4'>
                          {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                        </div>
                      </Field>
                    )}
                  />
                  <Controller
                    name='longitude'
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                        <FieldLabel htmlFor={field.name}>{t('profile.addressLongitude')}</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          type='number'
                          step='any'
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value === '' ? 0 : Number(event.target.value))}
                        />
                        <div className='min-h-4'>
                          {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                        </div>
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name='isDefault'
                  control={methods.control}
                  render={({ field }) => (
                    <Field orientation='horizontal' className='items-center gap-2.5'>
                      <Checkbox
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                      <FieldLabel htmlFor={field.name} className='w-auto p-0'>
                        {t('profile.addressIsDefault')}
                      </FieldLabel>
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <div className='flex items-center justify-end gap-3 border-t px-5 py-4'>
              <Button type='button' variant='outline' onClick={close} disabled={isPending}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? <Spinner /> : null}
                {isEditMode ? t('profile.updateAddress') : t('profile.createAddress')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface LocationComboboxProps {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  disabled?: boolean
  invalid?: boolean
}

function LocationCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  invalid,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !selected && 'text-muted-foreground')}
        >
          <span className='truncate'>{selected?.label ?? placeholder}</span>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={8}
        className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-(--radix-popover-trigger-width) overflow-y-auto p-0'
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command className='w-full'>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  data-checked={value === option.value}
                  onSelect={() => {
                    onChange(option.value === value ? '' : option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
