import { I18nKey } from '@/lib/i18n/types'

export const OrderStatus = {
  Pending: 'Pending',
  Paid: 'Paid',
  Cancelled: 'Cancelled'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusLabel: Record<OrderStatus, I18nKey> = {
  [OrderStatus.Pending]: 'orders.list.status.Pending',
  [OrderStatus.Paid]: 'orders.list.status.Paid',
  [OrderStatus.Cancelled]: 'orders.list.status.Cancelled'
}

export type OrderStatusLabel = (typeof OrderStatusLabel)[keyof typeof OrderStatusLabel]

export const PaymentMethod = {
  1: '1', // VA (BaoKim)
  6: '6' // VNPayQR (SePay)
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const PaymentMethodLabel: Record<PaymentMethod, I18nKey> = {
  [PaymentMethod[1]]: 'orders.list.paymentMethod.va',
  [PaymentMethod[6]]: 'orders.list.paymentMethod.vnPayQr'
}

export type PaymentMethodLabel = (typeof PaymentMethodLabel)[keyof typeof PaymentMethodLabel]

export const PaymentMethodDescription: Record<PaymentMethod, I18nKey> = {
  [PaymentMethod[1]]: 'orders.checkout.paymentMethod.va.description',
  [PaymentMethod[6]]: 'orders.checkout.paymentMethod.vnPayQr.description'
}

export type PaymentMethodDescription = (typeof PaymentMethodDescription)[keyof typeof PaymentMethodDescription]

export const PaymentGateway = {
  BaoKim: 'BaoKim',
  Sepay: 'Sepay'
} as const

export type PaymentGateway = (typeof PaymentGateway)[keyof typeof PaymentGateway]

export const PaymentGatewayLabel: Record<PaymentGateway, I18nKey> = {
  [PaymentGateway.BaoKim]: 'orders.checkout.paymentGateway.baoKim.label',
  [PaymentGateway.Sepay]: 'orders.checkout.paymentGateway.sePay.label'
}

export type PaymentGatewayLabel = (typeof PaymentGatewayLabel)[keyof typeof PaymentGatewayLabel]

export const PaymentGatewayDescription: Record<PaymentGateway, I18nKey> = {
  [PaymentGateway.BaoKim]: 'orders.checkout.paymentGateway.baoKim.description',
  [PaymentGateway.Sepay]: 'orders.checkout.paymentGateway.sePay.description'
}

export type PaymentGatewayDescription = (typeof PaymentGatewayDescription)[keyof typeof PaymentGatewayDescription]

// Which payment methods each gateway exposes. BaoKim uses VA (1);
// Sepay uses VNPayQR (6).
export const GatewayPaymentMethods: Record<PaymentGateway, PaymentMethod[]> = {
  [PaymentGateway.BaoKim]: [PaymentMethod[1]],
  [PaymentGateway.Sepay]: [PaymentMethod[6]]
}

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
  createAt: string
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
  paymentUrl: string | null
  sepayUrl: string | null
  paymentMethod: PaymentMethod
  transaction: OrderTransaction | null
  details: OrderItem[]
}

export interface OrderItem {
  orderDetailsId: string
  name: string
  itemId: string
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
  paymentMethod: PaymentMethod
  gateway: PaymentGateway
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

export interface GeocodeSuggestion {
  refId: string
  name: string
  address: string
  display: string
}

export interface GeocodeAutocompleteResponse {
  results: GeocodeSuggestion[]
}

export interface GeocodeResult {
  latitude: number
  longitude: number
  mapId: string
  display: string
}

export interface GeocodeResponse {
  result: GeocodeResult | null
}
