'use client'

import { Button } from '@/components/ui/button'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import { useAccountHref } from '@/features/users/hooks/use-account-href'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useGetUser } from '@/features/users/hooks/use-get-user'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { Alert02Icon, ArrowLeft02Icon, Call02Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { getCardsTotal } from '../../cards/card-data'
import { useCheckoutCards } from '../../cards/use-checkout-cards'
import { localizedMethodText } from '../../checkout-methods'
import { useCheckoutAddressSelection } from '../../hooks/use-checkout-address-selection'
import { useCheckoutDeliveryMethods } from '../../hooks/use-checkout-delivery-methods'
import { useCheckoutFlow } from '../../hooks/use-checkout-flow'
import { useCheckoutPaymentMethods } from '../../hooks/use-checkout-payment-methods'
import { useCheckoutSummary } from '../../hooks/use-checkout-summary'
import { useCreateOrder } from '../../hooks/use-create-order'
import { useEstimateOrder } from '../../hooks/use-estimate-order'
import { useFreeShipKm } from '../../hooks/use-free-ship-km'
import type { OrderContact } from '../../payloads'
import { resolveShippingFee } from '../../shipping-fee'
import type { TaxBusinessInfo } from '../../types'
import CheckoutCards from './cards/checkout-cards'
import { CheckoutPanel } from './checkout-section'
import CheckoutSidebar from './checkout-sidebar'
import CheckoutStepper from './checkout-stepper'
import StepComplete from './step-complete'
import StepPayment from './step-payment'
import StepPersonal from './step-personal'
import StepReview from './step-review'

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

export default function CheckoutClient() {
  const { t, locale } = useTranslation()
  const { formatDate } = useDateFormat()
  const router = useRouter()

  const { methods, estimateOrder, isEstimatingOrder, estimatedOrder, resetEstimate } = useEstimateOrder()
  const { createOrder, isCreatingOrder } = useCreateOrder()

  const { addresses, isLoading: isLoadingAddresses } = useGetAddresses({ enabled: true })
  const { orderTags } = useGetOrderTags()

  const { me, isGettingMe } = useGetMe()
  const ordersHref = useAccountHref('orders')
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

  const freeShipKm = useFreeShipKm()

  const {
    step,
    goBack,
    goNext,
    goToStep,
    items,
    source,
    isVerifyingAvailability,
    materialBlockedProductIds,
    estimatedGateway,
    handleGoToCards,
    handleConfirmOrder,
    handleCancel,
    clearEstimate,
    invalidateEstimate
  } = useCheckoutFlow({
    methods,
    estimateOrder,
    resetEstimate,
    createOrder,
    contact
  })

  const [manualAddress, setManualAddress] = useState(false)
  const [isLoadingShippingLocations, setIsLoadingShippingLocations] = useState(false)
  const [pickedPaymentMethodId, setPickedPaymentMethodId] = useState<string | null>(null)
  const [pickedDeliveryMethodId, setPickedDeliveryMethodId] = useState<string | null>(null)
  const [taxBusinessInfo, setTaxBusinessInfo] = useState<TaxBusinessInfo | null>(null)

  const handleSelectedAddressRevised = () => {
    toast.info(invalidateEstimate() ? t('orders.checkout.addressRevisedReprice') : t('orders.checkout.addressRevised'))
  }

  const { selectedAddressId, selectedAddress, handleSelectAddress, clearAddress } = useCheckoutAddressSelection({
    addresses,
    methods,
    manualAddress,
    onSelectedAddressRevised: handleSelectedAddressRevised
  })

  const [taxBusinessLookupState, setTaxBusinessLookupState] = useState<LookupState>('idle')

  const {
    methods: paymentMethods,
    defaultMethod: defaultPaymentMethod,
    isGettingMethods: isGettingPaymentMethods
  } = useCheckoutPaymentMethods()
  const selectedPaymentMethod =
    paymentMethods.find((method) => method.id === pickedPaymentMethodId) ?? defaultPaymentMethod
  const selectedPaymentMethodId = selectedPaymentMethod?.id ?? ''

  const quotes = useMemo(() => estimatedOrder?.quotes ?? [], [estimatedOrder])
  const {
    methods: deliveryMethods,
    defaultMethod: defaultDeliveryMethod,
    isGettingMethods: isGettingDeliveryMethods
  } = useCheckoutDeliveryMethods({ quotes, estimatedGateway })
  const selectedDeliveryMethod =
    deliveryMethods.find((method) => method.id === pickedDeliveryMethodId) ?? defaultDeliveryMethod
  const selectedDeliveryMethodId = selectedDeliveryMethod?.id ?? ''
  const selectedService = selectedDeliveryMethod?.quote

  // Each carrier is priced by its own estimate endpoint, so switching carriers
  // throws away the quote rather than showing one carrier's fee against another.
  const handleSelectDeliveryMethod = (id: string) => {
    setPickedDeliveryMethodId(id)

    const next = deliveryMethods.find((method) => method.id === id)
    if (next && next.shippingGateway !== estimatedGateway) {
      clearEstimate()
    }
  }

  const { isFreeShip, rawShippingFee, shippingFee, shippingDiscount } = resolveShippingFee(selectedService, freeShipKm)

  const watchedFullNameReceiver = useWatch({ control: methods.control, name: 'fullNameReceiver' })
  const watchedPhoneReceiver = useWatch({ control: methods.control, name: 'phoneReceiver' })
  const watchedAddressLine = useWatch({ control: methods.control, name: 'addressLine' })
  const watchedWard = useWatch({ control: methods.control, name: 'ward' })
  const watchedCity = useWatch({ control: methods.control, name: 'city' })
  const watchedOrderTime = useWatch({ control: methods.control, name: 'orderTime' })
  const watchedTagIds = useWatch({ control: methods.control, name: 'tagIds' })
  const watchedRemarks = useWatch({ control: methods.control, name: 'remarks' })
  const watchedTaxCode = useWatch({ control: methods.control, name: 'taxCode' })
  const watchedIsExportInvoice = useWatch({ control: methods.control, name: 'isExportInvoice' })

  const summaryRecipientName = watchedFullNameReceiver?.trim() || undefined
  const summaryRecipientPhone = watchedPhoneReceiver?.trim() || undefined
  const summaryAddress = [watchedAddressLine, watchedWard, watchedCity].filter(Boolean).join(', ')
  const summaryOrderTime = formatDate(watchedOrderTime ?? new Date(), 'dateLong')
  const selectedTagId = watchedTagIds?.[0]
  const summaryRemarks = watchedRemarks?.trim() || undefined

  const summaryDeliveryTime =
    selectedTagId !== undefined ? orderTags?.options?.find((o) => o.value === selectedTagId)?.label : undefined

  const summaryDeliveryMethodLabel = selectedDeliveryMethod
    ? localizedMethodText(selectedDeliveryMethod.label, locale)
    : undefined
  const summaryPaymentMethodLabel =
    step >= 3 && selectedPaymentMethod ? localizedMethodText(selectedPaymentMethod.label, locale) : undefined

  const hasTaxCode = !!(watchedIsExportInvoice && watchedTaxCode?.trim())

  const lineIds = useMemo(() => items.map((item) => item.lineId), [items])
  const { cards, generatedCards, saveCard, removeCard } = useCheckoutCards({ control: methods.control, lineIds })
  const cardsTotal = useMemo(() => getCardsTotal(cards, generatedCards), [cards, generatedCards])

  const { summaryLines, unavailableLines, hasUnavailableLines, totalItems, productsSubtotal, vatAmount, grandTotal } =
    useCheckoutSummary({
      items,
      hasTaxCode,
      shippingFee,
      cardsTotal,
      materialBlockedProductIds
    })

  const isLoading =
    isEstimatingOrder ||
    isCreatingOrder ||
    isLoadingAddresses ||
    isLoadingShippingLocations ||
    isVerifyingAvailability ||
    isGettingPaymentMethods ||
    isGettingDeliveryMethods

  const isBlockedByStock = hasUnavailableLines && step < 5

  const isBlockedByMaterialsOnly = unavailableLines.every((line) => line.issue === 'materials')

  const sidebarAction =
    step === 1
      ? {
          label: isVerifyingAvailability ? t('products.stock.checking') : t('orders.checkout.sidebar.continueToCards'),
          onClick: () => handleGoToCards(selectedDeliveryMethod?.shippingGateway),
          disabled: items.length === 0 || !selectedDeliveryMethod || isLoading || isBlockedByStock,
          loading: isEstimatingOrder || isVerifyingAvailability
        }
      : step === 2
        ? {
            label: t('orders.checkout.sidebar.goToPayment'),
            onClick: goNext,
            disabled: isLoading || isBlockedByStock
          }
        : step === 3
          ? {
              label: t('orders.checkout.sidebar.goToReview'),
              onClick: goNext,
              disabled: !selectedPaymentMethod || isLoading || isBlockedByStock
            }
          : step === 4
            ? {
                label: isVerifyingAvailability
                  ? t('products.stock.checking')
                  : t('orders.checkout.sidebar.payForBooking'),
                onClick: () =>
                  selectedPaymentMethod &&
                  selectedDeliveryMethod &&
                  handleConfirmOrder({
                    paymentMethod: selectedPaymentMethod.paymentMethod,
                    gateway: selectedPaymentMethod.gateway,
                    shippingGateway: selectedDeliveryMethod.shippingGateway,
                    shippingFee
                  }),
                disabled: !selectedPaymentMethod || !selectedDeliveryMethod || isLoading || isBlockedByStock,
                loading: isCreatingOrder || isVerifyingAvailability
              }
            : {
                label: t('orders.checkout.sidebar.viewOrders'),
                onClick: () => router.push(ordersHref)
              }

  const sidebarProps = {
    lines: summaryLines,
    totalItems,
    recipientName: summaryRecipientName,
    recipientPhone: summaryRecipientPhone,
    address: summaryAddress || undefined,
    orderTimeLabel: summaryOrderTime,
    deliveryTimeLabel: summaryDeliveryTime,
    remarks: summaryRemarks,
    deliveryMethodLabel: summaryDeliveryMethodLabel,
    paymentMethodLabel: summaryPaymentMethodLabel,
    productsSubtotal,
    vatAmount,
    hasTaxCode,
    cardsFee: cardsTotal,
    shippingFee: rawShippingFee,
    shippingDiscount,
    showShipping: step >= 2,
    grandTotal,
    action: sidebarAction,
    showTerms: step === 4,
    cards,
    generatedCards
  }

  return (
    <FormProvider {...methods}>
      <div className='mx-auto w-full max-w-7xl px-4 py-6 sm:py-8'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
          {step > 1 && step < 5 ? (
            <Button type='button' variant='outline' onClick={goBack} disabled={isCreatingOrder}>
              <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
              {t('orders.checkout.back')}
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button type='button' variant='ghost' onClick={handleCancel} className='text-destructive'>
              <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} />
              {t('orders.checkout.cancelBooking')}
            </Button>
          ) : null}
        </div>

        <CheckoutPanel className='mb-6 p-4 sm:p-5'>
          <CheckoutStepper current={step} />
        </CheckoutPanel>

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
          <>
            {isBlockedByStock ? (
              <div className='mb-4 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-3'>
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    strokeWidth={2}
                    className='mt-0.5 size-5 shrink-0 text-destructive'
                  />
                  <div className='space-y-0.5'>
                    <p className='text-sm font-semibold text-destructive'>
                      {isBlockedByMaterialsOnly
                        ? t('orders.checkout.stock.materialsBlockedTitle')
                        : t('orders.checkout.stock.blockedTitle')}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {isBlockedByMaterialsOnly
                        ? t('orders.checkout.stock.materialsBlockedBody')
                        : t('orders.checkout.stock.blockedBody')}
                    </p>
                  </div>
                </div>
                <Button asChild type='button' variant='outline' className='shrink-0'>
                  <Link href={source === 'buy-now' ? '/products' : '/cart'}>
                    {source === 'buy-now'
                      ? t('orders.checkout.stock.backToProducts')
                      : t('orders.checkout.stock.backToCart')}
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className='grid grid-cols-1 gap-2 lg:grid-cols-12'>
              <div className='space-y-2 lg:col-span-8'>
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
                    deliveryMethods={deliveryMethods}
                    selectedDeliveryMethodId={selectedDeliveryMethodId}
                    onSelectDeliveryMethod={handleSelectDeliveryMethod}
                  />
                ) : step === 2 ? (
                  <CheckoutCards
                    lines={summaryLines}
                    cards={cards}
                    generatedCards={generatedCards}
                    onSave={saveCard}
                    onRemove={removeCard}
                  />
                ) : step === 3 ? (
                  <StepPayment
                    paymentMethods={paymentMethods}
                    selectedPaymentMethodId={selectedPaymentMethodId}
                    onSelectPaymentMethod={setPickedPaymentMethodId}
                    taxBusinessInfo={taxBusinessInfo}
                    taxBusinessLookupState={taxBusinessLookupState}
                    onTaxBusinessInfoChange={setTaxBusinessInfo}
                    onTaxBusinessLookupStateChange={setTaxBusinessLookupState}
                  />
                ) : step === 4 ? (
                  <StepReview
                    lines={summaryLines}
                    cards={cards}
                    generatedCards={generatedCards}
                    onSaveCard={saveCard}
                    onRemoveCard={removeCard}
                    deliveryMethod={selectedDeliveryMethod}
                    paymentMethod={selectedPaymentMethod}
                    rawShippingFee={rawShippingFee}
                    isFreeShip={isFreeShip}
                    onEditStep={goToStep}
                  />
                ) : (
                  <StepComplete />
                )}
              </div>

              <div className='lg:col-span-4 lg:sticky lg:top-23 lg:self-start'>
                <CheckoutSidebar {...sidebarProps} showRecap={step !== 4} />
              </div>
            </div>
          </>
        )}
      </div>
    </FormProvider>
  )
}
