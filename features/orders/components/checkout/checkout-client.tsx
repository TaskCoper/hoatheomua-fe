'use client'

import { Button } from '@/components/ui/button'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useGetUser } from '@/features/users/hooks/use-get-user'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, useRouter } from '@/lib/i18n/navigation'
import type { AhamoveConfigItem } from '@/types/config.type'
import { ArrowLeft02Icon, Call02Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import { useCheckoutAddressSelection } from '../../hooks/use-checkout-address-selection'
import { useCheckoutFlow } from '../../hooks/use-checkout-flow'
import { useCheckoutSummary } from '../../hooks/use-checkout-summary'
import { useCreateOrder } from '../../hooks/use-create-order'
import { useEstimateOrder } from '../../hooks/use-estimate-order'
import type { OrderContact } from '../../payloads'
import { PaymentGateway, PaymentMethod, type TaxBusinessInfo } from '../../types'
import { CheckoutSidebar } from './checkout-sidebar'
import { CheckoutStepper } from './checkout-stepper'
import { StepComplete } from './step-complete'
import { StepPayment } from './step-payment'
import { StepPersonal } from './step-personal'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

export function CheckoutClient() {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const router = useRouter()

  const { methods, estimateOrder, isEstimatingOrder, estimatedOrder } = useEstimateOrder()
  const { createOrder, isCreatingOrder } = useCreateOrder()

  const { addresses, isLoading: isLoadingAddresses } = useGetAddresses({ enabled: true })
  const { orderTags } = useGetOrderTags()

  // The order's contact is whoever created it: the signed-in account. A saved
  // address carries its own receiverName/phoneNumber, but that only says who
  // receives at that door — it never becomes the order's fullName/phone.
  const { me, isGettingMe } = useGetMe()
  const { user, isLoading: isLoadingUser } = useGetUser(me?.slug)
  const isProfileLoading = isGettingMe || isLoadingUser
  const hasPhoneNumber = !!user?.phoneNumber
  const contact: OrderContact = useMemo(
    () => ({
      fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      phone: user?.phoneNumber ?? ''
    }),
    [user?.firstName, user?.lastName, user?.phoneNumber]
  )

  // Free-shipping distance threshold (km). Deliveries closer than this ship free.
  const { configs: ahamoveConfigs } = useGetPublicConfigs<AhamoveConfigItem>({ group: 'ahamove' })
  const freeShipKm = Number(ahamoveConfigs.find((config) => config.key === 'ahamove.free_ship')?.value.value)

  const { selectedAddressId, selectedAddress, handleSelectAddress, clearAddress } = useCheckoutAddressSelection({
    addresses,
    methods
  })

  const { step, goBack, items, handleGoToPayment, handleConfirmOrder, handleCancel } = useCheckoutFlow({
    methods,
    estimateOrder,
    createOrder,
    contact
  })

  const [manualAddress, setManualAddress] = useState(false)
  const [isLoadingShippingLocations, setIsLoadingShippingLocations] = useState(false)
  const [gateway, setGateway] = useState<PaymentGateway>(PaymentGateway.BaoKim)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('1')
  const [taxBusinessInfo, setTaxBusinessInfo] = useState<TaxBusinessInfo | null>(null)

  // Sepay only offers VNPayQR (6); BaoKim exposes the full method list.
  const handleGatewayChange = (value: PaymentGateway) => {
    setGateway(value)
    setPaymentMethod(value === PaymentGateway.Sepay ? PaymentMethod[6] : PaymentMethod[1])
  }
  const [taxBusinessLookupState, setTaxBusinessLookupState] = useState<LookupState>('idle')

  const sortedAhamove = useMemo(
    () =>
      estimatedOrder
        ? [...estimatedOrder.ahamoveResult].sort((a, b) => (a.data?.total_fee ?? 0) - (b.data?.total_fee ?? 0))
        : [],
    [estimatedOrder]
  )
  const [pickedServiceId, setPickedServiceId] = useState<string | null>(null)
  const selectedServiceId = pickedServiceId ?? sortedAhamove[0]?.service_id ?? ''
  const selectedService = sortedAhamove.find((s) => s.service_id === selectedServiceId)
  // Ahamove returns the delivery distance in km; a trip shorter than the
  // configured free-ship threshold waives the shipping fee entirely.
  const distanceKm = selectedService?.data?.distance ?? 0
  const isFreeShip = freeShipKm >= 0 && distanceKm >= 0 && distanceKm < freeShipKm
  const rawShippingFee = selectedService?.data?.total_fee ?? 0
  const shippingFee = isFreeShip ? 0 : rawShippingFee
  const shippingDiscount = isFreeShip ? rawShippingFee : 0

  const watchedAddressLine = useWatch({ control: methods.control, name: 'addressLine' })
  const watchedWard = useWatch({ control: methods.control, name: 'ward' })
  const watchedCity = useWatch({ control: methods.control, name: 'city' })
  const watchedOrderTime = useWatch({ control: methods.control, name: 'orderTime' })
  const watchedTagIds = useWatch({ control: methods.control, name: 'tagIds' })
  const watchedTaxCode = useWatch({ control: methods.control, name: 'taxCode' })
  const watchedIsExportInvoice = useWatch({ control: methods.control, name: 'isExportInvoice' })

  const summaryAddress = [watchedAddressLine, watchedWard, watchedCity].filter(Boolean).join(', ')
  const summaryOrderTime = formatDate(watchedOrderTime > 0 ? new Date(watchedOrderTime * 1000) : new Date(), 'dateLong')
  const selectedTagId = watchedTagIds?.[0]
  const summaryDeliveryTime =
    selectedTagId !== undefined ? orderTags?.options?.find((o) => o.value === selectedTagId)?.label : undefined

  const hasTaxCode = !!(watchedIsExportInvoice && watchedTaxCode?.trim())

  const { summaryLines, totalItems, productsSubtotal, vatAmount, grandTotal } = useCheckoutSummary({
    items,
    hasTaxCode,
    shippingFee
  })

  const isLoading = isEstimatingOrder || isCreatingOrder || isLoadingAddresses || isLoadingShippingLocations

  const sidebarAction =
    step === 1
      ? {
          label: t('orders.checkout.sidebar.goToPayment'),
          onClick: () => handleGoToPayment(),
          disabled: items.length === 0 || isLoading,
          loading: isEstimatingOrder
        }
      : step === 2
        ? {
            label: t('orders.checkout.sidebar.payForBooking'),
            onClick: () => handleConfirmOrder(paymentMethod, gateway, shippingFee),
            disabled: !selectedServiceId || isLoading,
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
            <Button type='button' variant='outline' onClick={goBack} disabled={isCreatingOrder}>
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

        {!isProfileLoading && !hasPhoneNumber && me?.slug ? (
          <div className='flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-muted/20 py-16 text-center text-muted-foreground'>
            <HugeiconsIcon icon={Call02Icon} size={36} strokeWidth={1.5} />
            <p className='text-sm'>{t('orders.checkout.contactMissing')}</p>
            <Button asChild type='button'>
              <Link href={`/users/${me.slug}`}>{t('profile.editPersonalInfo')}</Link>
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-2 lg:grid-cols-5'>
            <div className='space-y-2 lg:col-span-3'>
              {step === 1 ? (
                <StepPersonal
                  addresses={addresses}
                  isLoadingAddresses={isLoadingAddresses}
                  selectedAddressId={selectedAddressId}
                  selectedAddress={selectedAddress}
                  onSelectAddress={handleSelectAddress}
                  onClearAddress={clearAddress}
                  manualAddress={manualAddress}
                  onManualAddressChange={setManualAddress}
                  onLoadingShippingLocationsChange={setIsLoadingShippingLocations}
                />
              ) : step === 2 ? (
                <StepPayment
                  gateway={gateway}
                  onGatewayChange={handleGatewayChange}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  shippingOptions={sortedAhamove}
                  selectedServiceId={selectedServiceId}
                  onSelectShipping={setPickedServiceId}
                  taxBusinessInfo={taxBusinessInfo}
                  taxBusinessLookupState={taxBusinessLookupState}
                  onTaxBusinessInfoChange={setTaxBusinessInfo}
                  onTaxBusinessLookupStateChange={setTaxBusinessLookupState}
                />
              ) : (
                <StepComplete />
              )}
            </div>

            <div className='lg:col-span-2 lg:sticky lg:top-23 lg:self-start'>
              <CheckoutSidebar
                lines={summaryLines}
                totalItems={totalItems}
                address={summaryAddress || undefined}
                orderTimeLabel={summaryOrderTime}
                deliveryTimeLabel={summaryDeliveryTime}
                productsSubtotal={productsSubtotal}
                vatAmount={vatAmount}
                hasTaxCode={hasTaxCode}
                shippingFee={rawShippingFee}
                shippingDiscount={shippingDiscount}
                showShipping={step >= 2}
                grandTotal={grandTotal}
                action={sidebarAction}
                showTerms={step < 3}
              />
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  )
}
