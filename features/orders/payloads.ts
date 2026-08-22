import type { ProductDetail } from '@/features/products/types'
import type { CartItem } from '@/stores/cart.store'
import type { CheckoutPayload, EstimatePayload, PaymentGateway, PaymentMethod } from './types'
import { InvoiceType } from './types'
import type { CheckoutFormValues, EstimateFormValues } from './validations'

const emptyToNull = (value: string | null | undefined) => (value?.trim() ? value : null)

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
  const base = {
    ...buildEstimatePayload(values, items, productById, contact),
    phoneReceiver: values.phoneReceiver.trim()
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
      paymentMethod,
      gateway,
      shippingFee
    }
  }

  const isBusinessInvoice = values.invoiceType === InvoiceType.Business
  const isPersonalInvoice = values.invoiceType === InvoiceType.Personal

  return {
    ...base,
    taxCode: isBusinessInvoice ? emptyToNull(values.taxCode) : null,
    identityNumber: isPersonalInvoice ? emptyToNull(values.identityNumber) : null,
    receiptFullName: isPersonalInvoice ? emptyToNull(values.receiptFullName) : null,
    receiptAddress: isPersonalInvoice ? emptyToNull(values.receiptAddress) : null,
    receiptPhoneNumber: emptyToNull(values.receiptPhoneNumber),
    receiptEmail: emptyToNull(values.receiptEmail),
    isExportInvoice: true,
    invoiceType: values.invoiceType,
    paymentMethod,
    gateway,
    shippingFee
  }
}
