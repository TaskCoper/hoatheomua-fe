import { I18nKey } from '@/lib/i18n/types'

export const OrderStatus = {
  Pending: 'Pending',
  Paid: 'Paid'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusLabel: Record<OrderStatus, I18nKey> = {
  [OrderStatus.Pending]: 'orders.list.status.Pending',
  [OrderStatus.Paid]: 'orders.list.status.Paid'
}

export type OrderStatusLabel = (typeof OrderStatusLabel)[keyof typeof OrderStatusLabel]

export interface Order {
  orderId: string
  status: OrderStatus
  orderTime: number
  trackNumber: string
  nhanhOrderId: string | null
  nhanhTrackingUrl: string | null
  ahahaMoveOrderId: string | null
  ahahaMoveTrackingUrl: string | null
  createAt: string
  updateAt: null
}

export interface OrderTransaction {
  transferAmount: number
  code: string
  gateway: string
  transactionDate: string
}

export interface OrderDetail {
  orderId: string
  status: OrderStatus
  trackNumber: string
  ahahaMoveOrderId: string | null
  ahahaMoveTrackingUrl: string | null
  remark: string | null
  taxCode: string | null
  orderTime: number
  tagsId: number[]
  identityNumber: string | null
  invoiceType: InvoiceType | null
  isExportInvoice: boolean
  receiptAddress: string | null
  receiptEmail: string | null
  receiptFullName: string | null
  receiptPhoneNumber: string | null
  shippingFee: number
  productFee: number
  totalFee: number
  vatFee: number
  qrCodeUrl: string | null
  transaction: OrderTransaction | null
  details: OrderItem[]
}

export interface OrderItem {
  orderDetailsId: string
  name: string
  itemId: number
  number: number
  price: number
  weight: number
  length: number
  width: number
  height: number
}

export const InvoiceType = {
  Personal: 'Personal',
  Business: 'Business'
} as const

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType]

export const InvoiceTypeLabel: Record<InvoiceType, I18nKey> = {
  [InvoiceType.Personal]: 'orders.invoiceType.Personal',
  [InvoiceType.Business]: 'orders.invoiceType.Business'
} as const

export type InvoiceTypeLabel = (typeof InvoiceTypeLabel)[keyof typeof InvoiceTypeLabel]

export interface EstimatePayload {
  latitude: number
  longitude: number
  address: string
  shortAddress: string
  fullName: string
  phone: string
  remarks: string
  orderTime: number
  items: { itemId: string; number: number }[]
  tagIds: number[]
}

export interface CheckoutPayload extends EstimatePayload {
  taxCode: string | null
  identityNumber: string | null
  receiptFullName: string | null
  receiptPhoneNumber: string | null
  receiptAddress: string | null
  receiptEmail: string | null
  isExportInvoice: boolean
  invoiceType: InvoiceType | null
}

export interface TaxBusinessInfo {
  id: string
  name: string
  address: string
}

export type ShippingLocationType = 'CITY' | 'WARD'

export interface ShippingLocation {
  id: number
  name: string
}

export interface GeoLocation {
  lat: number
  lng: number
}

export interface GeoAddressComponent {
  long_name: string
  short_name: string
}

export interface GeoPlusCode {
  compound_code: string
  global_code: string
}

export interface GeoResult {
  address_components: GeoAddressComponent[]
  formatted_address: string
  geometry: { location: GeoLocation }
  place_id: string
  reference: string
  plus_code: GeoPlusCode
  types: string[]
}

export interface GeoResponse {
  plus_code: { compound_code?: string; global_code?: string }
  results: GeoResult[]
  status: string
}
