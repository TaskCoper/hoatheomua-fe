import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import orderService from '../services'
import { CheckoutFormValues, createCheckoutSchema } from '../validations'

const defaultValues: CheckoutFormValues = {
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
  orderTime: 0,
  tagIds: [],
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

  const schema = useMemo(() => createCheckoutSchema(t), [t])
  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const {
    mutateAsync: estimateOrder,
    isPending: isEstimatingOrder,
    data: estimatedOrder,
    reset: resetEstimate
  } = useMutation({
    mutationFn: orderService.estimateOrder
  })

  return { methods, estimateOrder, isEstimatingOrder, estimatedOrder, resetEstimate }
}
