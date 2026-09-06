import { useCheckCoreProducts } from '@/features/products/hooks/use-check-core-products'
import { useVerifySellableQuantity } from '@/features/products/hooks/use-verify-sellable-quantity'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
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

  const items = useCheckoutIntentStore((state) => state.items)
  const source = useCheckoutIntentStore((state) => state.source)
  const clearIntent = useCheckoutIntentStore((state) => state.clear)
  const removeCartItem = useCartStore((state) => state.removeItem)
  const productById = useProductsByIds(items)
  const { verifySellableQuantity, isVerifyingSellableQuantity } = useVerifySellableQuantity()
  const { checkCoreProducts, isCheckingCoreProducts } = useCheckCoreProducts()

  const [step, setStep] = useState<CheckoutStep>(1)

  const [estimatedGateway, setEstimatedGateway] = useState<ShippingGateway | null>(null)
  const [materialBlockedProductIds, setMaterialBlockedProductIds] = useState<ReadonlySet<string>>(() => new Set())
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    if (hasSubmittedRef.current) return
    if (items.length === 0) router.replace('/cart')
  }, [items.length, router])

  const goBack = () => setStep((prev) => (prev - 1) as CheckoutStep)

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
    setStep((prev) => Math.min(prev + 1, 5) as CheckoutStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = (next: CheckoutStep) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoToCards = async (shippingGateway: ShippingGateway | undefined) => {
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
      goToStep(2)
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

  const handleConfirmOrder = (selection: CheckoutSelection) =>
    methods.handleSubmit(
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
          const message = error instanceof Error ? error.message : t('orders.checkout.createError')
          toast.error(t('orders.checkout.createError'), { description: message })
        }
      },
      (errors) => {
        toast.error(t('common.validation.fixErrors'))
        goToStep(errors.cards ? 2 : 3)
      }
    )()

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
    isVerifyingAvailability: isVerifyingSellableQuantity || isCheckingCoreProducts,
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
