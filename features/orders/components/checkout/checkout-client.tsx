'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import { useAccountHref } from '@/features/users/hooks/use-account-href'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useGetUser } from '@/features/users/hooks/use-get-user'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { formatVnd } from '@/lib/currency'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { FeatureUnavailableNotice } from '@/shared/components/feature-unavailable-notice'
import StickyActionBar from '@/shared/components/sticky-action-bar'
import { isFeatureEnabled } from '@/shared/feature-flags'
import { cn } from '@/shared/utils'
import { Alert02Icon, ArrowDown01Icon, ArrowLeft02Icon, Call02Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { getCardsTotal } from '../../cards/card-data'
import { ARE_CARDS_ENABLED } from '../../cards/card-feature'
import { useCheckoutCards } from '../../cards/use-checkout-cards'
import { localizedMethodText } from '../../checkout-methods'
import { useCardConfig } from '../../hooks/use-card-config'
import { useCheckoutAddressSelection } from '../../hooks/use-checkout-address-selection'
import { useCheckoutDeliveryMethods } from '../../hooks/use-checkout-delivery-methods'
import { useCheckoutFlow } from '../../hooks/use-checkout-flow'
import { useCheckoutPaymentMethods } from '../../hooks/use-checkout-payment-methods'
import { useCheckoutSummary } from '../../hooks/use-checkout-summary'
import { useCreateOrder } from '../../hooks/use-create-order'
import { useEstimateOrder } from '../../hooks/use-estimate-order'
import { useFreeShipKm } from '../../hooks/use-free-ship-km'
import { useCheckoutVouchers } from '../../vouchers/hooks/use-checkout-vouchers'
import type { CheckoutVoucher } from '../../vouchers/types'
import type { OrderContact } from '../../payloads'
import { resolveShippingFee } from '../../shipping-fee'
import type { TaxBusinessInfo } from '../../types'
import CheckoutCards from './cards/checkout-cards'
import { CheckoutPanel } from './checkout-section'
import CheckoutSidebar, { CheckoutTerms } from './checkout-sidebar'
import CheckoutStepper, { CHECKOUT_CARDS_STEP } from './checkout-stepper'
import StepComplete from './step-complete'
import StepPayment from './step-payment'
import StepPersonal from './step-personal'
import StepReview from './step-review'
import VoucherPicker from './voucher-picker'

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
    canPlaceOrder,
    canQuoteShipping,
    isVerifyingAvailability,
    isUploadingAttachments,
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

  const [termsAccepted, setTermsAccepted] = useState(true)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  const [manualAddress, setManualAddress] = useState(false)
  const [isLoadingShippingLocations, setIsLoadingShippingLocations] = useState(false)
  const [pickedPaymentMethodId, setPickedPaymentMethodId] = useState<string | null>(null)
  const [pickedDeliveryMethodId, setPickedDeliveryMethodId] = useState<string | null>(null)
  const [taxBusinessInfo, setTaxBusinessInfo] = useState<TaxBusinessInfo | null>(null)
  const [selectedVoucher, setSelectedVoucher] = useState<CheckoutVoucher | null>(null)

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

  const { cardConfig } = useCardConfig()
  const { cards, saveCard, removeCard } = useCheckoutCards({ control: methods.control, lines: items })

  const cardsTotal = useMemo(() => (ARE_CARDS_ENABLED ? getCardsTotal(cards, cardConfig) : 0), [cards, cardConfig])

  const { summaryLines, unavailableLines, hasUnavailableLines, totalItems, productsSubtotal, vatAmount, grandTotal } =
    useCheckoutSummary({
      items,
      hasTaxCode,
      shippingFee,
      cardsTotal,
      materialBlockedProductIds
    })

  const voucherProducts = useMemo(
    () =>
      summaryLines
        .filter((line) => line.issue !== 'missing' && line.issue !== 'inactive' && line.quantity > 0)
        .map((line) => ({ id: line.productId, quantity: line.quantity }))
        .sort((a, b) => a.id.localeCompare(b.id) || a.quantity - b.quantity),
    [summaryLines]
  )
  const { vouchers, unavailableVouchers, estimatePrivateVoucher, isEstimatingPrivate } = useCheckoutVouchers(
    productsSubtotal,
    voucherProducts
  )

  const voucherDiscount = selectedVoucher?.discountAmount ?? 0
  const displayGrandTotal = Math.max(0, grandTotal - voucherDiscount)

  const isLoading =
    isEstimatingOrder ||
    isCreatingOrder ||
    isLoadingAddresses ||
    isLoadingShippingLocations ||
    isVerifyingAvailability ||
    isUploadingAttachments ||
    isGettingPaymentMethods ||
    isGettingDeliveryMethods

  const isBlockedByStock = hasUnavailableLines && step < 5

  const isBlockedByMaterialsOnly = unavailableLines.every((line) => line.issue === 'materials')

  // Step 1 prices the delivery with the carrier, step 4 books and pays for it -
  // each step is gated by the flag that owns the side effect it triggers. Steps 2
  // and 3 (cards, payment method) only move between screens, so they stay open.
  const canPay = isFeatureEnabled('payment')
  const isStepBlockedByFlag = step === 1 ? !canQuoteShipping : step === 4 ? !canPlaceOrder || !canPay : false

  const sidebarAction =
    step === 1
      ? {
          label: isVerifyingAvailability
            ? t('products.stock.checking')
            : t(ARE_CARDS_ENABLED ? 'orders.checkout.sidebar.continueToCards' : 'orders.checkout.sidebar.goToPayment'),
          onClick: () => handleGoToCards(selectedDeliveryMethod?.shippingGateway),
          disabled:
            items.length === 0 || !selectedDeliveryMethod || isLoading || isBlockedByStock || isStepBlockedByFlag,
          loading: isEstimatingOrder || isVerifyingAvailability
        }
      : step === CHECKOUT_CARDS_STEP
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
                    shippingFee,
                    voucherCode: selectedVoucher?.code ?? null
                  }),
                disabled:
                  !selectedPaymentMethod ||
                  !selectedDeliveryMethod ||
                  isLoading ||
                  isBlockedByStock ||
                  isStepBlockedByFlag,
                loading: isCreatingOrder || isVerifyingAvailability || isUploadingAttachments
              }
            : {
                label: t('orders.checkout.sidebar.viewOrders'),
                onClick: () => router.push(ordersHref)
              }

  const isActionDisabled =
    sidebarAction.disabled || sidebarAction.loading || (step === 4 && !termsAccepted) || isBlockedByStock

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
    grandTotal: displayGrandTotal,
    voucherDiscount,
    vouchers,
    unavailableVouchers,
    selectedVoucher,
    onSelectVoucher: step === 4 ? setSelectedVoucher : undefined,
    onEstimatePrivateVoucher: step === 4 ? estimatePrivateVoucher : undefined,
    isEstimatingPrivate,
    action: sidebarAction,
    showTerms: step === 4,
    cards,
    termsAccepted,
    onTermsAcceptedChange: setTermsAccepted
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
            {step < 5 ? (
              <div className='mb-3 overflow-hidden rounded-3xl border border-border bg-card lg:hidden'>
                <button
                  type='button'
                  onClick={() => setIsSummaryOpen((open) => !open)}
                  aria-expanded={isSummaryOpen}
                  aria-controls='checkout-compact-summary'
                  className='flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-left'
                >
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    strokeWidth={2}
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform',
                      isSummaryOpen && 'rotate-180'
                    )}
                  />
                  <span className='min-w-0 flex-1 truncate text-sm font-semibold'>
                    {t('orders.checkout.sidebar.summaryTitle')}
                    <span className='ml-1.5 font-normal text-muted-foreground'>
                      {t('orders.checkout.sidebar.itemsCount', { count: totalItems })}
                    </span>
                  </span>
                  <span className='shrink-0 font-title text-base font-bold text-primary tabular-nums'>
                    {formatVnd(displayGrandTotal)}
                  </span>
                </button>

                {isSummaryOpen ? (
                  <div id='checkout-compact-summary' className='border-t border-dashed border-border p-1'>
                    <CheckoutSidebar
                      {...sidebarProps}
                      showRecap={step !== 4}
                      sticky={false}
                      showAction={false}
                      notice={null}
                      onSelectVoucher={undefined}
                    />
                  </div>
                ) : null}
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
                ) : step === CHECKOUT_CARDS_STEP ? (
                  <CheckoutCards lines={summaryLines} cards={cards} onSave={saveCard} onRemove={removeCard} />
                ) : step === 3 ? (
                  <StepPayment
                    paymentMethods={paymentMethods}
                    selectedPaymentMethodId={selectedPaymentMethodId}
                    onSelectPaymentMethod={setPickedPaymentMethodId}
                    taxBusinessInfo={taxBusinessInfo}
                    taxBusinessLookupState={taxBusinessLookupState}
                    onTaxBusinessInfoChange={setTaxBusinessInfo}
                    onTaxBusinessLookupStateChange={setTaxBusinessLookupState}
                    canPay={canPay}
                  />
                ) : step === 4 ? (
                  <StepReview
                    lines={summaryLines}
                    cards={cards}
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

                {step === 4 ? (
                  <VoucherPicker
                    vouchers={vouchers}
                    unavailableVouchers={unavailableVouchers}
                    productsSubtotal={productsSubtotal}
                    selectedVoucher={selectedVoucher}
                    onSelect={setSelectedVoucher}
                    onEstimatePrivateVoucher={estimatePrivateVoucher}
                    isEstimatingPrivate={isEstimatingPrivate}
                    className='lg:hidden'
                  />
                ) : null}

                {step === 4 ? (
                  <CheckoutPanel className='p-4 lg:hidden'>
                    {isStepBlockedByFlag ? <FeatureUnavailableNotice className='mb-3' /> : null}
                    <CheckoutTerms accepted={termsAccepted} onAcceptedChange={setTermsAccepted} />
                  </CheckoutPanel>
                ) : null}
              </div>

              <div className='top-below-header hidden lg:sticky lg:col-span-4 lg:block lg:self-start'>
                <CheckoutSidebar
                  {...sidebarProps}
                  showRecap={step !== 4}
                  notice={isStepBlockedByFlag ? <FeatureUnavailableNotice /> : null}
                />
              </div>
            </div>
            {step < 5 ? (
              <StickyActionBar aria-label={t('orders.checkout.title')}>
                <div className='flex items-center gap-3'>
                  <div className='min-w-0 shrink-0'>
                    <p className='text-[0.625rem] leading-none font-medium text-muted-foreground'>
                      {t('orders.checkout.total')}
                    </p>
                    <p className='truncate font-title text-lg leading-tight font-bold text-primary tabular-nums'>
                      {formatVnd(displayGrandTotal)}
                    </p>
                  </div>

                  <Button
                    type='button'
                    size='lg'
                    className='ml-auto min-w-0 flex-1'
                    onClick={sidebarAction.onClick}
                    disabled={isActionDisabled}
                  >
                    {sidebarAction.loading ? <Spinner /> : null}
                    <span className='truncate'>{sidebarAction.label}</span>
                  </Button>
                </div>
              </StickyActionBar>
            ) : null}
          </>
        )}
      </div>
    </FormProvider>
  )
}
