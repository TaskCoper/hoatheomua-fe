import type { CartItem } from '@/stores/cart.store'
import type { CheckoutPayload, EstimatePayload } from './types'
import type { CheckoutFormValues, EstimateFormValues } from './validations'

export const buildEstimatePayload = (
  values: EstimateFormValues,
  items: CartItem[]
): EstimatePayload => {
  const fullAddress = `${values.addressLine}, ${values.ward}, ${values.city}`

  return {
    latitude: values.latitude,
    longitude: values.longitude,
    address: fullAddress,
    shortAddress: fullAddress,
    fullName: values.fullName,
    phone: values.phone,
    remarks: values.remarks,
    orderTime: values.orderTime ? Math.floor(new Date(values.orderTime).getTime() / 1000) : 0,
    items: items.map((item) => ({
      itemId: String(item.productId),
      number: item.quantity
    })),
    tagIds: values.tagIds
  }
}

export const buildCheckoutPayload = (
  values: CheckoutFormValues,
  items: CartItem[]
): CheckoutPayload => {
  const base = buildEstimatePayload(values, items)

  if (!values.isExportInvoice) {
    return {
      ...base,
      taxCode: null,
      identityNumber: null,
      receiptFullName: null,
      receiptPhoneNumber: null,
      receiptAddress: null,
      receiptEmail: null,
      isExportInvoice: false,
      invoiceType: null
    }
  }

  return {
    ...base,
    taxCode: values.taxCode?.trim() ? values.taxCode : null,
    identityNumber: values.identityNumber?.trim() ? values.identityNumber : null,
    receiptFullName: values.receiptFullName?.trim() ? values.receiptFullName : null,
    receiptPhoneNumber: values.receiptPhoneNumber?.trim() ? values.receiptPhoneNumber : null,
    receiptAddress: values.receiptAddress?.trim() ? values.receiptAddress : null,
    receiptEmail: values.receiptEmail?.trim() ? values.receiptEmail : null,
    isExportInvoice: true,
    invoiceType: values.invoiceType
  }
}
