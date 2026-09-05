import { useCheckCoreProducts } from '@/features/products/hooks/use-check-core-products'
import { useVerifySellableQuantity } from '@/features/products/hooks/use-verify-sellable-quantity'
import { useFeatureUnavailableToast } from '@/hooks/use-feature-unavailable-toast'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { FeatureUnavailableError, isFeatureEnabled, ORDERING_DISABLED_REDIRECT_PATH } from '@/shared/feature-flags'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { CheckoutStep } from '../components/checkout/checkout-stepper'
import { buildCheckoutPayload, buildEstimatePayload, type OrderContact } from '../payloads'
import type { CheckoutSelection, ShippingGateway } from '../types'
import { createEstimateSchema, type CheckoutFormValues } from '../validations'
import { useCreateOrder } from './use-create-order'
import { useEstimateOrder } from './use-estimate-order'
import { useProductsByIds } from './use-products-by-ids'

interface UseCheckoutFlowArgs {
  methods: UseFormReturn<CheckoutFormValues>
  estimateOrder: ReturnType<typeof useEstimateOrder>['estimateOrder']
  resetEstimate: ReturnType<typeof useEstimateOrder>['resetEstimate']
  createOrder: ReturnType<typeof useCreateOrder>['createOrder']
  contact: OrderContact
}

export const useCheckoutFlow = ({
  methods,
  estimateOrder,
  resetEstimate,
  createOrder,
  contact
}: UseCheckoutFlowArgs) => {
  const { t } = useTranslation()
  const router = useRouter()
  const notifyUnavailable = useFeatureUnavailableToast()

  // Mirrors the middleware block in proxy.ts, for the soft navigations it does
  // not see (a prefetched route entered from the cart, a stale client bundle).
  const canPlaceOrder = isFeatureEnabled('ordering')
  const canQuoteShipping = isFeatureEnabled('externalServices')

  const items = useCheckoutIntentStore((state) => state.items)
  const source = useCheckoutIntentStore((state) => state.source)
  const clearIntent = useCheckoutIntentStore((state) => state.clear)
  const removeCartItem = useCartStore((state) => state.removeItem)
  const productById = useProductsByIds(items)
  const { verifySellableQuantity, isVerifyingSellableQuantity } = useVerifySellableQuantity()
  const { checkCoreProducts, isCheckingCoreProducts } = useCheckCoreProducts()

  const [step, setStep] = useState<CheckoutStep>(1)
  // The carrier the quote in hand was priced by. Null means nothing is priced.
  const [estimatedGateway, setEstimatedGateway] = useState<ShippingGateway | null>(null)
  const [materialBlockedProductIds, setMaterialBlockedProductIds] = useState<ReadonlySet<string>>(() => new Set())
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    if (!canPlaceOrder) {
      router.replace(ORDERING_DISABLED_REDIRECT_PATH)
      return
    }

    if (hasSubmittedRef.current) return
    if (items.length === 0) router.replace('/cart')
  }, [canPlaceOrder, items.length, router])

  const goBack = () => setStep((prev) => (prev - 1) as CheckoutStep)

  // `fullName`/`phone` come from the signed-in account (`useGetUser`), never the
  // form. Nothing on screen surfaces them, so a still-loading or incomplete
  // profile would otherwise ship an order with both fields blank.
  const hasContact = () => {
    if (contact.fullName.trim() && contact.phone.trim()) return true
    toast.error(t('orders.checkout.contactMissing'))
    return false
  }

  // Stock and materials are separate limits, and either can have moved since the cart.
  const isFulfillable = async () => {
    const wanted = items.map((item) => ({
      productId: item.productId,
      productName: productById.get(item.productId)?.productName ?? null,
      quantity: item.quantity
    }))

    const [stock, core] = await Promise.all([verifySellableQuantity(wanted), checkCoreProducts(wanted)])

    // The toast is gone in a few seconds; the summary keeps the offending lines
    // marked until a later check clears them.
    setMaterialBlockedProductIds(core.blockedProductIds)

    return stock.ok && core.ok
  }

  const handleGoToPayment = async (shippingGateway: ShippingGateway | undefined) => {
    if (!canQuoteShipping) {
      notifyUnavailable()
      return
    }

    if (items.length === 0) {
      toast.error(t('orders.checkout.emptyCart'))
      return
    }

    if (!shippingGateway) {
      toast.error(t('orders.checkout.shippingMissing'))
      return
    }

    if (!hasContact()) return

    methods.clearErrors()

    const parsed = createEstimateSchema(t).safeParse(methods.getValues())
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.') as keyof CheckoutFormValues
        methods.setError(path, { type: 'zod', message: issue.message })
      }
      toast.error(t('common.validation.fixErrors'))
      return
    }

    if (!(await isFulfillable())) return

    try {
      await estimateOrder({
        body: buildEstimatePayload(parsed.data, items, productById, contact),
        shippingGateway
      })
      setEstimatedGateway(shippingGateway)
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }

  const clearEstimate = () => {
    resetEstimate()
    setEstimatedGateway(null)
  }

  // Address changed during payment. Drop the stale shippingFee and rewind
  // so the new address is shown before estimating again
  const invalidateEstimate = () => {
    if (step !== 2) {
      return false
    }

    clearEstimate()
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return true
  }

  const handleConfirmOrder = (selection: CheckoutSelection) => {
    // Confirming both places the order and opens a payment session upstream.
    if (!canPlaceOrder || !isFeatureEnabled('payment')) {
      notifyUnavailable()
      return
    }

    return methods.handleSubmit(
      async (values) => {
        if (!hasContact()) return
        if (!(await isFulfillable())) return

        try {
          const { mrc_order_id } = await createOrder({
            body: buildCheckoutPayload(values, items, productById, contact, selection)
          })

          if (source === 'cart') {
            items.forEach((item) => removeCartItem(item.lineId))
          }

          hasSubmittedRef.current = true
          clearIntent()

          router.push(`/orders/${mrc_order_id}`)
        } catch (error) {
          // The service-level backstop speaks English; say it in the buyer's language.
          if (error instanceof FeatureUnavailableError) {
            notifyUnavailable()
            return
          }

          const message = error instanceof Error ? error.message : t('orders.checkout.createError')
          toast.error(t('orders.checkout.createError'), { description: message })
        }
      },
      () => toast.error(t('common.validation.fixErrors'))
    )()
  }

  const handleCancel = () => {
    clearIntent()
    router.replace(source === 'cart' ? '/cart' : '/products')
  }

  return {
    step,
    setStep,
    goBack,
    items,
    source,
    canPlaceOrder,
    canQuoteShipping,
    isVerifyingAvailability: isVerifyingSellableQuantity || isCheckingCoreProducts,
    materialBlockedProductIds,
    estimatedGateway,
    handleGoToPayment,
    handleConfirmOrder,
    handleCancel,
    clearEstimate,
    invalidateEstimate
  }
}
