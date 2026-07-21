import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import { useCartStore } from '@/stores/cart.store'
import { useCheckoutIntentStore } from '@/stores/checkout-intent.store'
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { CheckoutStep } from '../components/checkout/checkout-stepper'
import { buildCheckoutPayload, buildEstimatePayload } from '../payloads'
import type { PaymentMethod } from '../types'
import { createEstimateSchema, type CheckoutFormValues } from '../validations'
import { useCreateOrder } from './use-create-order'
import { useEstimateOrder } from './use-estimate-order'

interface UseCheckoutFlowArgs {
  methods: UseFormReturn<CheckoutFormValues>
  estimateOrder: ReturnType<typeof useEstimateOrder>['estimateOrder']
  createOrder: ReturnType<typeof useCreateOrder>['createOrder']
}

export const useCheckoutFlow = ({ methods, estimateOrder, createOrder }: UseCheckoutFlowArgs) => {
  const { t } = useTranslation()
  const router = useRouter()

  const items = useCheckoutIntentStore((state) => state.items)
  const source = useCheckoutIntentStore((state) => state.source)
  const clearIntent = useCheckoutIntentStore((state) => state.clear)
  const removeCartItem = useCartStore((state) => state.removeItem)

  const [step, setStep] = useState<CheckoutStep>(1)
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    if (hasSubmittedRef.current) return
    if (items.length === 0) router.replace('/cart')
  }, [items.length, router])

  const goBack = () => setStep((prev) => (prev - 1) as CheckoutStep)

  const handleGoToPayment = async () => {
    if (items.length === 0) {
      toast.error(t('orders.checkout.emptyCart'))
      return
    }

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
      await estimateOrder({ body: buildEstimatePayload(parsed.data, items) })
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('orders.checkout.estimateError')
      toast.error(t('orders.checkout.estimateError'), { description: message })
    }
  }

  const handleConfirmOrder = (paymentMethod: PaymentMethod) =>
    methods.handleSubmit(
      async (values) => {
        try {
          const { payment_url } = await createOrder({ body: buildCheckoutPayload(values, items, paymentMethod) })

          if (source === 'cart') {
            items.forEach((item) => removeCartItem(item.lineId))
          }

          hasSubmittedRef.current = true
          clearIntent()

          if (payment_url) {
            window.open(payment_url, '_blank', 'noopener,noreferrer')
          }
          router.push('/orders')
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
    handleCancel
  }
}
