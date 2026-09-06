import type { ProductSummary } from '@/features/products/types'
import type { CartItem } from '@/stores/cart.store'
import type { CheckoutPayload, CheckoutSelection, EstimatePayload } from './types'
import { PaymentGatewayCode } from './types'
import type { CheckoutFormValues, EstimateFormValues } from './validations'

export interface OrderContact {
  fullName: string
  phone: string
}

// The form holds the delivery date as an ISO string; the API wants unix seconds
// and reads 0 as "as soon as possible". Today collapses to 0 - its midnight
// timestamp is already in the past by the time the order is placed.
export const toOrderTimestamp = (value: string | null): number => {
  if (!value) {
    return 0
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 0
  }

  if (date.toDateString() === new Date().toDateString()) {
    return 0
  }

  return Math.floor(date.getTime() / 1000)
}

export const buildEstimatePayload = (
  values: EstimateFormValues,
  items: CartItem[],
  productById: Map<string, ProductSummary>,
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
    orderTime: toOrderTimestamp(values.orderTime),
    items: items.map((item) => ({
      itemId: productById.get(item.productId)?.nhanhProductId ?? item.productId,
      productId: item.productId,
      number: item.quantity
    })),
    tagIds: values.tagIds
  }
}

// TODO(backend): `values.cards` is validated but dropped here - `CheckoutPayload` has no
// card field yet. Map it in once the order API accepts cards.
export const buildCheckoutPayload = (
  values: CheckoutFormValues,
  items: CartItem[],
  productById: Map<string, ProductSummary>,
  contact: OrderContact,
  selection: CheckoutSelection
): CheckoutPayload => {
  const { paymentMethod, gateway, shippingGateway, shippingFee } = selection

  const base = {
    ...buildEstimatePayload(values, items, productById, contact),
    fullNameReceiver: values.fullNameReceiver.trim(),
    phoneReceiver: values.phoneReceiver.trim()
  }

  const gateways = {
    paymentMethod,
    gateway,
    paymentGateway: PaymentGatewayCode[gateway],
    shippingGateway,
    shippingFee
  }

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
      ...gateways
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
    ...gateways
  }
}
