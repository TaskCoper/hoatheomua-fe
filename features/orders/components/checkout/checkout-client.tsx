'use client'

import { Button } from '@/components/ui/button'
import { useGetAddresses } from '@/features/addresses/hooks/use-get-addresses'
import { useGetOrderTags } from '@/hooks/use-get-order-tags'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { ArrowLeft02Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { FormProvider, useWatch } from 'react-hook-form'
import { useCheckoutAddressSelection } from '../../hooks/use-checkout-address-selection'
import { useCheckoutFlow } from '../../hooks/use-checkout-flow'
import { useCheckoutSummary } from '../../hooks/use-checkout-summary'
import { useCreateOrder } from '../../hooks/use-create-order'
import { useEstimateOrder } from '../../hooks/use-estimate-order'
import type { TaxBusinessInfo } from '../../types'
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

  const { selectedAddressId, handleSelectAddress } = useCheckoutAddressSelection({ addresses, methods })

  const { step, goBack, items, handleGoToPayment, handleConfirmOrder, handleCancel } = useCheckoutFlow({
    methods,
    estimateOrder,
    createOrder
  })

  const [taxBusinessInfo, setTaxBusinessInfo] = useState<TaxBusinessInfo | null>(null)
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
  const shippingFee = sortedAhamove.find((s) => s.service_id === selectedServiceId)?.data?.total_fee ?? 0

  const watchedAddressLine = useWatch({ control: methods.control, name: 'addressLine' })
  const watchedWard = useWatch({ control: methods.control, name: 'ward' })
  const watchedCity = useWatch({ control: methods.control, name: 'city' })
  const watchedOrderTime = useWatch({ control: methods.control, name: 'orderTime' })
  const watchedTagIds = useWatch({ control: methods.control, name: 'tagIds' })
  const watchedTaxCode = useWatch({ control: methods.control, name: 'taxCode' })
  const watchedIsExportInvoice = useWatch({ control: methods.control, name: 'isExportInvoice' })

  const summaryAddress = [watchedAddressLine, watchedWard, watchedCity].filter(Boolean).join(', ')
  const summaryOrderTime = watchedOrderTime ? formatDate(new Date(watchedOrderTime), 'dateLong') : undefined
  const selectedTagId = watchedTagIds?.[0]
  const summaryDeliveryTime =
    selectedTagId !== undefined ? orderTags?.options?.find((o) => o.value === selectedTagId)?.label : undefined

  const hasTaxCode = !!(watchedIsExportInvoice && watchedTaxCode?.trim())

  const { summaryLines, totalItems, productsSubtotal, vatAmount, grandTotal } = useCheckoutSummary({
    items,
    hasTaxCode,
    shippingFee
  })

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
            onClick: () => handleConfirmOrder(),
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

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6'>
          <div className='space-y-4 lg:col-span-2'>
            {step === 1 ? (
              <StepPersonal
                addresses={addresses}
                isLoadingAddresses={isLoadingAddresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectAddress}
              />
            ) : step === 2 ? (
              <StepPayment
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
