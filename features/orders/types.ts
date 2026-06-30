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

export interface OrderDetail {
  orderId: string
  status: OrderStatus
  trackNumber: string
  ahahaMoveOrderId: string | null
  ahahaMoveTrackingUrl: string | null
  qrCodeUrl: string | null
  transaction: {
    transferAmount: number
    code: string
    gateway: string
    transactionDate: string
  } | null
}

export interface CheckoutPayload {
  latitude: number
  longitude: number
  address: string
  shortAddress: string
  fullName: string
  phone: string
  remarks: string
  /** Unix timestamp in SECONDS for scheduled delivery. `0` means deliver now. */
  orderTime: number
  taxCode: string
  items: { itemId: string; number: number }[]
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
