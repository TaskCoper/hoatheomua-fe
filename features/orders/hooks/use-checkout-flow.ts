import { useCheckCoreProducts } from '@/features/products/hooks/use-check-core-products'
import { useVerifySellableQuantity } from '@/features/products/hooks/use-verify-sellable-quantity'
import { useFeatureUnavailableToast } from '@/hooks/use-feature-unavailable-toast'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { FeatureUnavailableError, isFeatureEnabled, ORDERING_DISABLED_REDIRECT_PATH } from '@/shared/feature-flags'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { ARE_CARDS_ENABLED } from '../cards/card-feature'
import { CHECKOUT_CARDS_STEP, CHECKOUT_STEPS, type CheckoutStep } from '../components/checkout/checkout-stepper'
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
  const { uploadFileWithToast, isUploading: isUploadingAttachments } = useUploadFileWithToast()

  const [step, setStep] = useState<CheckoutStep>(1)

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

  const stepAt = (from: CheckoutStep, offset: number): CheckoutStep => {
    const index = CHECKOUT_STEPS.indexOf(from)
    return CHECKOUT_STEPS[Math.min(Math.max(index + offset, 0), CHECKOUT_STEPS.length - 1)] ?? from
  }

  const goBack = () => setStep((prev) => stepAt(prev, -1))

  const hasContact = () => {
    if (contact.fullName.trim() && contact.phone.trim()) return true
    toast.error(t('orders.checkout.contactMissing'))
    return false
  }

  const isFulfillable = async () => {
    const wanted = items.map((item) => ({
      productId: item.productId,
      productName: productById.get(item.productId)?.productName ?? null,
      quantity: item.quantity
    }))

    const [stock, core] = await Promise.all([verifySellableQuantity(wanted), checkCoreProducts(wanted)])

    setMaterialBlockedProductIds(core.blockedProductIds)

    return stock.ok && core.ok
  }

  const goNext = () => {
    setStep((prev) => stepAt(prev, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = (next: CheckoutStep) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoToCards = async (shippingGateway: ShippingGateway | undefined) => {
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
      goToStep(stepAt(1, 1))
    } catch {}
  }

  const clearEstimate = () => {
    resetEstimate()
    setEstimatedGateway(null)
  }

  const invalidateEstimate = () => {
    if (step === 1 || step === 5) {
      return false
    }

    clearEstimate()
    goToStep(1)
    return true
  }

  /** Card photos upload here, not on pick, so an abandoned checkout uploads nothing. */
  const uploadCardAttachments = async (
    cards: CheckoutFormValues['cards']
  ): Promise<CheckoutFormValues['cards'] | null> => {
    const uploaded = await Promise.all(
      cards.map(async (card) => {
        if (card.type !== 'ai' || !card.attachedImage) return card

        const attachedImageUrl = await uploadFileWithToast({
          file: card.attachedImage,
          showSuccessToast: false,
          renderProgress: (progress) => t('orders.checkout.cards.attachmentProgress', { progress })
        })

        return attachedImageUrl ? { ...card, attachedImageUrl } : null
      })
    )

    return uploaded.every((card) => card !== null) ? (uploaded as CheckoutFormValues['cards']) : null
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
          const cards = ARE_CARDS_ENABLED ? await uploadCardAttachments(values.cards) : []
          if (!cards) return

          const { mrc_order_id } = await createOrder({
            body: buildCheckoutPayload({ ...values, cards }, items, productById, contact, selection)
          })

          if (source === 'cart') {
            items.forEach((item) => removeCartItem(item.lineId))
          }

          hasSubmittedRef.current = true
          clearIntent()

          router.push(`/orders/${mrc_order_id}`)
        } catch (error) {
          if (error instanceof FeatureUnavailableError) {
            notifyUnavailable()
            return
          }
        }
      },
      (errors) => {
        toast.error(t('common.validation.fixErrors'))
        goToStep(ARE_CARDS_ENABLED && errors.cards ? CHECKOUT_CARDS_STEP : 3)
      }
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
    isUploadingAttachments,
    materialBlockedProductIds,
    estimatedGateway,
    goNext,
    goToStep,
    handleGoToCards,
    handleConfirmOrder,
    handleCancel,
    clearEstimate,
    invalidateEstimate
  }
}
