import type { ProductDetail } from '@/features/products/types'
import type { CartItem } from '@/stores/cart.store'
import type { CheckoutPayload, EstimatePayload, PaymentGateway, PaymentMethod } from './types'
import type { CheckoutFormValues, EstimateFormValues } from './validations'

export interface OrderContact {
  fullName: string
  phone: string
}

export const buildEstimatePayload = (
  values: EstimateFormValues,
  items: CartItem[],
  productById: Map<string, ProductDetail>,
  contact: OrderContact
): EstimatePayload => {
  const fullAddress = `${values.addressLine}, ${values.ward}, ${values.city}`

  return {
    latitude: values.latitude,
    longitude: values.longitude,
    address: fullAddress,
    shortAddress: fullAddress,
    fullName: contact.fullName,
    phone: contact.phone,
    remarks: values.remarks,
    orderTime: values.orderTime,
    items: items.map((item) => ({
      itemId: productById.get(item.productId)?.nhanhProductId ?? item.productId,
      number: item.quantity
    })),
    tagIds: values.tagIds
  }
}

export const buildCheckoutPayload = (
  values: CheckoutFormValues,
  items: CartItem[],
  productById: Map<string, ProductDetail>,
  contact: OrderContact,
  paymentMethod: PaymentMethod,
  gateway: PaymentGateway,
  shippingFee: number
): CheckoutPayload => {
  const base = buildEstimatePayload(values, items, productById, contact)

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
      invoiceType: null,
      paymentMethod,
      gateway,
      shippingFee
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
    invoiceType: values.invoiceType,
    paymentMethod,
    gateway,
    shippingFee
  }
}
