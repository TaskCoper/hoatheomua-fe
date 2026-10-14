import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import orderService from '../services'
import type { CheckoutFallback } from '../types'
import { fallbackToastOptions } from '../utils/fallback-toast'
import { CheckoutFormValues, createCheckoutSchema } from '../validations'
import { useCardConfig } from './use-card-config'

const defaultValues: CheckoutFormValues = {
  fullNameReceiver: '',
  phoneReceiver: '',
  remarks: '',
  addressLine: '',
  ward: '',
  city: '',
  cityCode: -1,
  wardCode: -1,
  latitude: 0,
  longitude: 0,
  mapId: '',
  orderTime: null,
  tagIds: [],
  cards: [],
  taxCode: null,
  identityNumber: null,
  receiptFullName: null,
  receiptPhoneNumber: null,
  receiptAddress: null,
  receiptEmail: null,
  isExportInvoice: false,
  invoiceType: null
}

export const useEstimateOrder = () => {
  const { t } = useTranslation()
  const { cardConfig } = useCardConfig()

  const schema = useMemo(() => createCheckoutSchema(t, cardConfig), [t, cardConfig])
  // Most of this form is steered by custom controls (selects, comboboxes, the map) that never
  // report a blur, and the steps validate by `trigger` rather than by submitting - so only
  // `onChange` clears an error the moment the user fixes it.
  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  })

  const {
    mutateAsync: estimateOrder,
    isPending: isEstimatingOrder,
    data: estimatedOrder,
    reset: resetEstimate
  } = useMutation({
    mutationFn: ({ body, shippingGateway }: Parameters<typeof orderService.estimateOrder>[0] & { fallback?: CheckoutFallback }) =>
      orderService.estimateOrder({ body, shippingGateway }),
    onError: (error, { fallback }) => {
      toast.error(t('orders.checkout.estimateError'), {
        description: error.response?.data?.detail,
        ...fallbackToastOptions(fallback)
      })
    }
  })

  return { methods, estimateOrder, isEstimatingOrder, estimatedOrder, resetEstimate }
}
