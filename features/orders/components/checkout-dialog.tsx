'use client'

import { DatePickerField } from '@/components/date-picker-field'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCartHydrated } from '@/hooks/use-cart-hydrated'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { type CartItem, useCartStore } from '@/stores/cart.store'
import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  DeliveryTruck02Icon,
  Location04Icon,
  Note02Icon,
  UserIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce'
import type { AhamoveResult, ProductNhanh } from '../ahamove.type'
import { useCreateOrder } from '../hooks/use-create-order'
import { useEstimateOrder } from '../hooks/use-estimate-order'
import { useGetLatLng } from '../hooks/use-get-lat-lng'
import { useGetShippingLocations } from '../hooks/use-get-shipping-locations'
import { pickBestGeocodeResult } from '../services'
import type { CheckoutPayload } from '../types'
import { type CheckoutFormValues } from '../validations'

export type { CheckoutPayload }

interface CheckoutDialogProps {
  children: React.ReactNode
  /**
   * Cart lines to check out. Defaults to the entire cart if omitted —
   * pass the user's current selection from the cart page here.
   */
  items?: CartItem[]
  onConfirm?: (payload: CheckoutPayload, shippingServiceId: string) => void
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatVnd = (value: number) => vndFormatter.format(value)

export default function CheckoutDialog({ children, items, onConfirm }: CheckoutDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const { methods, estimateOrder, isEstimatingOrder, estimatedOrder, resetEstimate } = useEstimateOrder()
  const { createOrder, isCreatingOrder, resetCreate } = useCreateOrder()

  const hasHydrated = useCartHydrated()
  const cartItems = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const checkoutItems = items ?? cartItems

  const [lastPayload, setLastPayload] = useState<CheckoutPayload | null>(null)

  const close = () => {
    setOpen(false)
    methods.reset()
    resetEstimate()
    resetCreate()
    setLastPayload(null)
  }

  const onValid = async (values: CheckoutFormValues) => {
    if (checkoutItems.length === 0) {
      toast.error(t('orders.checkout.emptyCart'))
      return
    }

    const fullAddress = `${values.addressLine}, ${values.ward}, ${values.city}`
    const payload: CheckoutPayload = {
      latitude: values.latitude,
      longitude: values.longitude,
      address: fullAddress,
      shortAddress: fullAddress,
      fullName: values.fullName,
      phone: values.phone,
      remarks: values.remarks ?? '',
      orderTime: values.orderTime ? Math.floor(new Date(values.orderTime).getTime() / 1000) : 0,
      items: checkoutItems.map((item) => ({
        itemId: String(item.productId),
        number: item.quantity
      }))
    }

    try {
      await estimateOrder({ body: payload })
      setLastPayload(payload)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('orders.checkout.estimateError')
      toast.error(t('orders.checkout.estimateError'), { description: message })
    }
  }

  const onInvalid = () => {
    toast.error(t('common.validation.fixErrors'))
  }

  const handleSubmit = methods.handleSubmit(onValid, onInvalid)

  const isCartEmpty = hasHydrated && checkoutItems.length === 0
  const hasResult = !!estimatedOrder

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          methods.reset()
          resetEstimate()
          resetCreate()
          setLastPayload(null)
        }
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-2xl' position='top-center' onInteractOutside={close}>
        <DialogHeader>
          <DialogTitle>{hasResult ? t('orders.checkout.reviewTitle') : t('orders.checkout.title')}</DialogTitle>
          <DialogDescription>
            {hasResult ? t('orders.checkout.reviewDescription') : t('orders.checkout.description')}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          {hasResult ? (
            <EstimateResultPanel
              cartItems={checkoutItems}
              ahamove={estimatedOrder.ahamoveResult}
              products={estimatedOrder.productNhanhResult.data}
              payload={lastPayload}
              isConfirming={isCreatingOrder}
              onBack={() => {
                if (isCreatingOrder) return
                resetEstimate()
              }}
              onConfirm={async (serviceId) => {
                if (!lastPayload) {
                  close()
                  return
                }
                try {
                  await createOrder({ body: lastPayload })
                  checkoutItems.forEach((item) => removeItem(item.lineId))
                  onConfirm?.(lastPayload, serviceId)
                  toast.success(t('orders.checkout.confirmedToast'))
                  close()
                } catch (error) {
                  const message = error instanceof Error ? error.message : t('orders.checkout.createError')
                  toast.error(t('orders.checkout.createError'), { description: message })
                }
              }}
            />
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <CheckoutFields />

              {isCartEmpty ? <p className='text-sm text-destructive'>{t('orders.checkout.emptyCart')}</p> : null}

              <div className='flex justify-end gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={close}>
                  {t('orders.checkout.cancel')}
                </Button>
                <Button type='submit' disabled={isEstimatingOrder || isCartEmpty}>
                  {isEstimatingOrder ? <Spinner /> : null}
                  {t('orders.checkout.submit')}
                </Button>
              </div>
            </form>
          )}
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

function CheckoutFields() {
  const { t } = useTranslation()
  const { control, setValue, watch } = useFormContext<CheckoutFormValues>()

  const cityCodeForm = watch('cityCode')
  const addressLineForm = watch('addressLine')
  const wardForm = watch('ward')
  const cityForm = watch('city')

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

  const { latLng } = useGetLatLng({ address: debouncedAddress, enabled: !!debouncedAddress })

  useEffect(() => {
    if (!debouncedAddress) return
    const best = pickBestGeocodeResult(debouncedAddress, latLng)
    if (!best) return
    setValue('latitude', best.geometry.location.lat, { shouldDirty: true })
    setValue('longitude', best.geometry.location.lng, { shouldDirty: true })
    setValue('mapId', best.place_id, { shouldDirty: true })
  }, [latLng, debouncedAddress, setValue])

  return (
    <FieldGroup className='gap-2'>
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

interface EstimateResultPanelProps {
  cartItems: CartItem[]
  ahamove: AhamoveResult[]
  products: ProductNhanh[]
  payload: CheckoutPayload | null
  isConfirming: boolean
  onBack: () => void
  onConfirm: (serviceId: string) => void
}

function EstimateResultPanel({
  cartItems,
  ahamove,
  products,
  payload,
  isConfirming,
  onBack,
  onConfirm
}: EstimateResultPanelProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const sortedAhamove = useMemo(
    () => [...ahamove].sort((a, b) => (a.data?.total_fee ?? 0) - (b.data?.total_fee ?? 0)),
    [ahamove]
  )
  const [selectedServiceId, setSelectedServiceId] = useState<string>(sortedAhamove[0]?.service_id ?? '')

  const productById = useMemo(() => {
    const map = new Map<number, ProductNhanh>()
    products.forEach((p) => map.set(p.id, p))
    return map
  }, [products])

  const lines = useMemo(
    () =>
      cartItems.map((item) => {
        const product = productById.get(item.productId)
        const unitPrice = product?.prices?.retail ?? 0
        return {
          lineId: item.lineId,
          name: product?.name ?? `#${item.productId}`,
          image: product?.images?.avatar ?? null,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity
        }
      }),
    [cartItems, productById]
  )

  const productsSubtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)

  const selectedService = sortedAhamove.find((s) => s.service_id === selectedServiceId) ?? sortedAhamove[0]
  const shippingFee = selectedService?.data?.total_fee ?? 0
  const grandTotal = productsSubtotal + shippingFee

  const orderTimeLabel =
    payload && payload.orderTime > 0
      ? formatDate(new Date(payload.orderTime * 1000), 'dateTimeMedium')
      : t('orders.checkout.deliverNow')
  const remarksLabel = payload?.remarks?.trim() ? payload.remarks : t('orders.checkout.noRemarks')

  return (
    <div className='flex flex-col gap-4'>
      {payload ? (
        <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
          <header className='mb-3 flex items-center gap-2'>
            <span className='inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={Location04Icon} strokeWidth={2} className='size-4' />
            </span>
            <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.recipientHeading')}</h3>
          </header>
          <dl className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.fullName')}</dt>
                <dd className='truncate font-medium'>
                  {payload.fullName} · {payload.phone}
                </dd>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon
                icon={Location04Icon}
                strokeWidth={2}
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.addressLine')}</dt>
                <dd className='font-medium'>{payload.address}</dd>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon
                icon={Calendar03Icon}
                strokeWidth={2}
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.orderTime')}</dt>
                <dd className='font-medium'>{orderTimeLabel}</dd>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <HugeiconsIcon
                icon={Note02Icon}
                strokeWidth={2}
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              />
              <div className='min-w-0'>
                <dt className='text-xs text-muted-foreground'>{t('orders.checkout.remarks')}</dt>
                <dd className={cn('font-medium', !payload.remarks?.trim() && 'text-muted-foreground italic')}>
                  {remarksLabel}
                </dd>
              </div>
            </div>
          </dl>
        </section>
      ) : null}

      <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
        <header className='mb-3 flex items-center justify-between'>
          <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.productsHeading')}</h3>
          <span className='text-xs text-muted-foreground'>
            {t('orders.checkout.lineCount', { count: lines.length })}
          </span>
        </header>
        <ul className='divide-y divide-border/60'>
          {lines.map((line) => (
            <li key={line.lineId} className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'>
              <div className='relative size-12 shrink-0 overflow-hidden rounded-2xl bg-secondary/40 ring-1 ring-foreground/5'>
                {line.image ? (
                  <Image src={line.image} alt={line.name} fill className='object-cover' sizes='48px' />
                ) : null}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{line.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {t('orders.checkout.lineQty', { qty: line.quantity, price: formatVnd(line.unitPrice) })}
                </p>
              </div>
              <span className='text-sm font-semibold text-primary'>{formatVnd(line.subtotal)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className='rounded-3xl bg-card p-4 ring-1 ring-foreground/5'>
        <header className='mb-3 flex items-center gap-2'>
          <span className='inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <HugeiconsIcon icon={DeliveryTruck02Icon} strokeWidth={2} className='size-4' />
          </span>
          <h3 className='font-heading text-sm font-semibold'>{t('orders.checkout.shippingHeading')}</h3>
        </header>

        {sortedAhamove.length === 0 ? (
          <p className='text-sm text-muted-foreground'>{t('orders.checkout.shippingEmpty')}</p>
        ) : (
          <RadioGroup value={selectedServiceId} onValueChange={setSelectedServiceId} className='gap-2'>
            {sortedAhamove.map((service, index) => {
              const isActive = service.service_id === selectedServiceId

              return (
                <label
                  key={service.service_id}
                  htmlFor={`ship-${service.service_id}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-2xl border bg-background/60 px-3 py-2.5 transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border/60 hover:bg-muted/40'
                  )}
                >
                  <RadioGroupItem id={`ship-${service.service_id}`} value={service.service_id} />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='truncate text-sm font-medium'>{service.service_id}</p>
                      {index === 0 ? (
                        <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary'>
                          {t('orders.checkout.bestPrice')}
                        </span>
                      ) : null}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {t('orders.checkout.shippingMeta', {
                        km: (service.data?.distance ?? 0).toFixed(1),
                        min: Math.max(1, Math.round((service.data?.duration ?? 0) / 60))
                      })}
                    </p>
                  </div>
                  <span className='text-sm font-semibold text-primary'>{formatVnd(service.data?.total_fee ?? 0)}</span>
                </label>
              )
            })}
          </RadioGroup>
        )}
      </section>

      <section className='rounded-3xl bg-secondary/20 p-4 ring-1 ring-foreground/5'>
        <dl className='space-y-1 text-sm'>
          <div className='flex justify-between text-muted-foreground'>
            <dt>{t('orders.checkout.subtotal')}</dt>
            <dd>{formatVnd(productsSubtotal)}</dd>
          </div>
          <div className='flex justify-between text-muted-foreground'>
            <dt>{t('orders.checkout.shippingFee')}</dt>
            <dd>{formatVnd(shippingFee)}</dd>
          </div>
          <div className='mt-2 flex items-baseline justify-between border-t border-border/60 pt-2'>
            <dt className='text-sm font-semibold'>{t('orders.checkout.total')}</dt>
            <dd className='font-title text-2xl font-bold text-primary'>{formatVnd(grandTotal)}</dd>
          </div>
        </dl>
      </section>

      <div className='flex flex-wrap justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onBack} disabled={isConfirming}>
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
          {t('orders.checkout.back')}
        </Button>
        <Button
          type='button'
          onClick={() => onConfirm(selectedServiceId)}
          disabled={!selectedServiceId || isConfirming}
        >
          {isConfirming ? <Spinner /> : <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />}
          {t('orders.checkout.confirm')}
        </Button>
      </div>
    </div>
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
  invalid
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
