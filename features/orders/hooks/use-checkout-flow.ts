import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { CheckoutStep } from '../components/checkout/checkout-stepper'
import { buildCheckoutPayload, buildEstimatePayload, type OrderContact } from '../payloads'
import type { PaymentGateway, PaymentMethod } from '../types'
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

  const [step, setStep] = useState<CheckoutStep>(1)
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    if (hasSubmittedRef.current) return
    if (items.length === 0) router.replace('/cart')
  }, [items.length, router])

  const goBack = () => setStep((prev) => (prev - 1) as CheckoutStep)

  // `fullName`/`phone` come from the signed-in account (`useGetUser`), never the
  // form. Nothing on screen surfaces them, so a still-loading or incomplete
  // profile would otherwise ship an order with both fields blank.
  const hasContact = () => {
    if (contact.fullName.trim() && contact.phone.trim()) return true
    toast.error(t('orders.checkout.contactMissing'))
    return false
  }

  const handleGoToPayment = async () => {
    if (items.length === 0) {
      toast.error(t('orders.checkout.emptyCart'))
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

    try {
      await estimateOrder({ body: buildEstimatePayload(parsed.data, items, productById, contact) })
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }

  // Address changed during payment. Drop the stale shippingFee and rewind
  // so the new address is shown before estimating again
  const invalidateEstimate = () => {
    if (step !== 2) {
      return false
    }

    resetEstimate()
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return true
  }

  const handleConfirmOrder = (paymentMethod: PaymentMethod, gateway: PaymentGateway, shippingFee: number) =>
    methods.handleSubmit(
      async (values) => {
        if (!hasContact()) return

        try {
          const { mrc_order_id } = await createOrder({
            body: buildCheckoutPayload(values, items, productById, contact, paymentMethod, gateway, shippingFee)
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
      () => toast.error(t('common.validation.fixErrors'))
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
    handleGoToPayment,
    handleConfirmOrder,
    handleCancel,
    invalidateEstimate
  }
}
