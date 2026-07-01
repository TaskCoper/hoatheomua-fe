'use client'

import { Button } from '@/components/ui/button'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import type { Address } from '@/features/addresses/types'
import { productDetailQuery } from '@/features/products/queries'
import type { ProductDetail } from '@/features/products/types'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { ArrowLeft02Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueries } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useCreateOrder } from '../../hooks/use-create-order'
import { useEstimateOrder } from '../../hooks/use-estimate-order'
import type { CheckoutPayload, TaxBusinessInfo } from '../../types'
import type { CheckoutFormValues } from '../../validations'
import { CheckoutSidebar, type CheckoutSummaryLine } from './checkout-sidebar'
import { CheckoutStepper, type CheckoutStep } from './checkout-stepper'
import { StepComplete } from './step-complete'
import { StepPayment } from './step-payment'
import { StepPersonal } from './step-personal'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

export function CheckoutClient() {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const router = useRouter()
  const locale = useLocale()

  const items = useCheckoutIntentStore((state) => state.items)
  const source = useCheckoutIntentStore((state) => state.source)
  const clearIntent = useCheckoutIntentStore((state) => state.clear)
  const removeCartItem = useCartStore((state) => state.removeItem)

  useEffect(() => {
    if (items.length === 0) router.replace('/cart')
  }, [items.length, router])

  const [step, setStep] = useState<CheckoutStep>(1)

  const { methods, estimateOrder, isEstimatingOrder, estimatedOrder } = useEstimateOrder()
  const { createOrder, isCreatingOrder } = useCreateOrder()

  const { addresses, isLoading: isLoadingAddresses } = useGetAddresses({ enabled: true })
  const { orderTags } = useGetOrderTags()

  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [taxBusinessInfo, setTaxBusinessInfo] = useState<TaxBusinessInfo | null>(null)
  const [taxBusinessLookupState, setTaxBusinessLookupState] = useState<LookupState>('idle')
  const [lastPayload, setLastPayload] = useState<CheckoutPayload | null>(null)
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

  // Product data from Nhanh (for sidebar preview + subtotal). Same source cart page uses.
  const productIds = useMemo(() => Array.from(new Set(items.map((item) => item.productId))), [items])
  const productQueries = useQueries({
    queries: productIds.map((id) => productDetailQuery(String(id), locale))
  })
  const productById = useMemo(() => {
    const map = new Map<number, ProductDetail>()
    productIds.forEach((id, index) => {
      const product = productQueries[index]?.data?.value?.data as ProductDetail | undefined
      if (product) map.set(id, product)
    })
    return map
  }, [productIds, productQueries])

  const summaryLines: CheckoutSummaryLine[] = useMemo(
    () =>
      items.map((item) => {
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
    [items, productById]
  )

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const productsSubtotal = summaryLines.reduce((sum, line) => sum + line.subtotal, 0)

  // Shipping picker state (used from step 2 onwards).
  const sortedAhamove = useMemo(
    () =>
      estimatedOrder
        ? [...estimatedOrder.ahamoveResult].sort((a, b) => (a.data?.total_fee ?? 0) - (b.data?.total_fee ?? 0))
        : [],
    [estimatedOrder]
  )
  const [pickedServiceId, setPickedServiceId] = useState<string | null>(null)
  const selectedServiceId = pickedServiceId ?? sortedAhamove[0]?.service_id ?? ''
  const shippingFee = sortedAhamove.find((s) => s.service_id === selectedServiceId)?.data?.total_fee ?? 0

  // Watched form values for the sidebar summary.
  const watchedAddressLine = useWatch({ control: methods.control, name: 'addressLine' })
  const watchedWard = useWatch({ control: methods.control, name: 'ward' })
  const watchedCity = useWatch({ control: methods.control, name: 'city' })
  const watchedOrderTime = useWatch({ control: methods.control, name: 'orderTime' })
  const watchedTagIds = useWatch({ control: methods.control, name: 'tagIds' })
  const watchedTaxCode = useWatch({ control: methods.control, name: 'taxCode' })

  const summaryAddress = [watchedAddressLine, watchedWard, watchedCity].filter(Boolean).join(', ')
  const summaryOrderTime = watchedOrderTime ? formatDate(new Date(watchedOrderTime), 'dateLong') : undefined
  const selectedTagId = watchedTagIds?.[0]
  const summaryDeliveryTime =
    selectedTagId !== undefined ? orderTags?.options?.find((o) => o.value === selectedTagId)?.label : undefined

  const hasTaxCode = !!watchedTaxCode?.trim()
  const vatAmount = hasTaxCode ? Math.round(productsSubtotal * 0.08) : 0
  const grandTotal = productsSubtotal + vatAmount + shippingFee

  const buildPayload = (values: CheckoutFormValues): CheckoutPayload => {
    const fullAddress = `${values.addressLine}, ${values.ward}, ${values.city}`
    return {
      latitude: values.latitude,
      longitude: values.longitude,
      address: fullAddress,
      shortAddress: fullAddress,
      fullName: values.fullName,
      phone: values.phone,
      remarks: values.remarks ?? '',
      orderTime: values.orderTime ? Math.floor(new Date(values.orderTime).getTime() / 1000) : 0,
      taxCode: values.taxCode ?? '',
      items: items.map((item) => ({
        itemId: String(item.productId),
        number: item.quantity
      })),
      tagIds: values.tagIds ?? []
    }
  }

  const handleGoToPayment = methods.handleSubmit(
    async (values) => {
      if (items.length === 0) {
        toast.error(t('orders.checkout.emptyCart'))
        return
      }
      const payload = buildPayload(values)
      try {
        await estimateOrder({ body: payload })
        setLastPayload(payload)
        setStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        const message = error instanceof Error ? error.message : t('orders.checkout.estimateError')
        toast.error(t('orders.checkout.estimateError'), { description: message })
      }
    },
    () => toast.error(t('common.validation.fixErrors'))
  )

  const handleConfirmOrder = async () => {
    if (!lastPayload) return
    try {
      await createOrder({ body: lastPayload })
      if (source === 'cart') {
        items.forEach((item) => removeCartItem(item.lineId))
      }

      clearIntent()
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      router.push('/orders')
    } catch (error) {
      const message = error instanceof Error ? error.message : t('orders.checkout.createError')
      toast.error(t('orders.checkout.createError'), { description: message })
    }
  }

  const handleCancel = () => {
    clearIntent()
    router.replace(source === 'cart' ? '/cart' : '/products')
  }

  const sidebarAction =
    step === 1
      ? {
          label: t('orders.checkout.sidebar.goToPayment'),
          onClick: () => handleGoToPayment(),
          disabled: items.length === 0,
          loading: isEstimatingOrder
        }
      : step === 2
        ? {
            label: t('orders.checkout.sidebar.payForBooking'),
            onClick: handleConfirmOrder,
            disabled: !selectedServiceId,
            loading: isCreatingOrder
          }
        : {
            label: t('orders.checkout.sidebar.viewOrders'),
            onClick: () => router.push('/orders')
          }

  return (
    <FormProvider {...methods}>
      <div className='mx-auto w-full max-w-6xl px-4 py-6 sm:py-8'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
          {step > 1 && step < 3 ? (
            <Button
              type='button'
              variant='outline'
              onClick={() => setStep((prev) => (prev - 1) as CheckoutStep)}
              disabled={isCreatingOrder}
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
              {t('orders.checkout.back')}
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button type='button' variant='ghost' onClick={handleCancel} className='text-destructive'>
              <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} />
              {t('orders.checkout.cancelBooking')}
            </Button>
          ) : null}
        </div>

        <div className='mb-6 rounded-3xl bg-card p-4 sm:p-5 border border-border'>
          <CheckoutStepper current={step} />
        </div>

        <h1 className='mb-4 font-title text-2xl font-bold sm:mb-6 sm:text-3xl'>{t('orders.checkout.title')}</h1>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6'>
          <div className='space-y-4 lg:col-span-2'>
            {step === 1 ? (
              <StepPersonal
                addresses={addresses}
                isLoadingAddresses={isLoadingAddresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectAddress}
                taxBusinessInfo={taxBusinessInfo}
                taxBusinessLookupState={taxBusinessLookupState}
                onTaxBusinessInfoChange={setTaxBusinessInfo}
                onTaxBusinessLookupStateChange={setTaxBusinessLookupState}
              />
            ) : step === 2 ? (
              <StepPayment
                shippingOptions={sortedAhamove}
                selectedServiceId={selectedServiceId}
                onSelectShipping={setPickedServiceId}
              />
            ) : (
              <StepComplete />
            )}
          </div>

          <div className='lg:col-span-1'>
            <CheckoutSidebar
              lines={summaryLines}
              totalItems={totalItems}
              address={summaryAddress || undefined}
              orderTimeLabel={summaryOrderTime}
              deliveryTimeLabel={summaryDeliveryTime}
              productsSubtotal={productsSubtotal}
              vatAmount={vatAmount}
              hasTaxCode={hasTaxCode}
              shippingFee={shippingFee}
              grandTotal={grandTotal}
              action={sidebarAction}
              showTerms={step < 3}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
