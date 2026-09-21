import { I18nKey } from '@/lib/i18n/types'
import type { EstimateProduct } from './ahamove.type'

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

export const PaymentGatewayCode = {
  [PaymentGateway.BaoKim]: 1,
  [PaymentGateway.Sepay]: 2
} as const satisfies Record<PaymentGateway, number>

export type PaymentGatewayCode = (typeof PaymentGatewayCode)[PaymentGateway]

export const ShippingGateway = {
  Ahamove: 1,
  XanhSm: 2
} as const

export type ShippingGateway = (typeof ShippingGateway)[keyof typeof ShippingGateway]

export const ShippingGatewayLabel: Record<ShippingGateway, I18nKey> = {
  [ShippingGateway.Ahamove]: 'orders.checkout.shippingGateway.ahamove.label',
  [ShippingGateway.XanhSm]: 'orders.checkout.shippingGateway.xanhSm.label'
}

export type ShippingGatewayLabel = (typeof ShippingGatewayLabel)[keyof typeof ShippingGatewayLabel]

export interface ShippingQuote {
  serviceId: string | null
  shippingGateway: ShippingGateway
  distanceKm: number
  durationSeconds: number
  totalFee: number
}

export const GatewayPaymentMethods: Record<PaymentGateway, PaymentMethod[]> = {
  [PaymentGateway.BaoKim]: [PaymentMethod[1]],
  [PaymentGateway.Sepay]: [PaymentMethod[6]]
}

export interface GetOrdersParams {
  pageIndex?: number
  pageSize?: number
  status?: OrderStatus
}

export interface OrderSummaryItem {
  productId: string
  name: string
  coverImage: string | null
  quantity: number
  price: number
  parent: OrderSummaryItemParent | null
}

export interface OrderSummaryItemParent {
  productId?: string | null
  name?: string | null
}

export interface Order {
  orderId: string
  status: OrderStatus
  orderTime: number
  trackNumber: string
  paymentGateway: PaymentGatewayCode
  shippingGateway: ShippingGateway
  shippingPartyOrderId: string | null
  shippingTrackingUrl: string | null
  address: string
  remark: string | null
  taxcode: string | null
  tagsId: number[]
  identityNumber: string | null
  invoiceType: InvoiceType | null
  isExportInvoice: boolean
  receiptAddress: string | null
  receiptEmail: string | null
  receiptFullName: string | null
  receiptPhoneNumber: string | null
  totalFee: number
  items: OrderSummaryItem[]
  createAt: string
  updateAt: string | null
}

export interface OrderTransaction {
  transferAmount: number
  code: string
  gateway: string
  transactionDate: string
}

export interface OrderDetail {
  orderId: string
  userId: string
  status: OrderStatus
  createAt: string
  trackNumber: string
  paymentGateway: PaymentGatewayCode
  shippingGateway: ShippingGateway
  shippingPartyOrderId: string | null
  shippingTrackingUrl: string | null
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
  fullName: string | null
  phone: string | null
  fullNameReceiver: string | null
  phoneReceiver: string | null
  address: string | null
  shortAddress: string | null
  latitude: number
  longitude: number
  ward: number
  city: number
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

/**
 * The card kinds as the order *response* spells them. The create payload sends the numbers of
 * `OrderCardType`; the snapshot the order keeps writes the same two kinds as strings.
 * `'handmade'` is inferred from the card-template endpoint - only `'ai'` is seen in a response.
 */
export const OrderSnapshotCardType = {
  Ai: 'ai',
  Handmade: 'handmade'
} as const

export type OrderSnapshotCardType = (typeof OrderSnapshotCardType)[keyof typeof OrderSnapshotCardType]

/** Same again for `OrderCardFormType`: `'go_may'` is confirmed, `'calligraphy'` is inferred. */
export const OrderSnapshotFormType = {
  GoMay: 'go_may',
  Calligraphy: 'calligraphy'
} as const

export type OrderSnapshotFormType = (typeof OrderSnapshotFormType)[keyof typeof OrderSnapshotFormType]

export interface OrderSnapshotCardTemplate {
  templateId: string | null
  templateName: string | null
  templateImageUrl: string | null
  templateType: string | null
}

/** `card_config.sizes` as it stood when the order was paid for, camel-cased by the API. */
export interface OrderSnapshotCardSize {
  name: string | null
  width: number
  height: number
  basePrice: number
  maxWords: number
}

/** One tier of `card_config.prices`, as the snapshot froze it. */
export interface OrderSnapshotCardConfig {
  minWords: number | null
  maxWords: number | null
  extraPrice: number | null
}

/** The card ordered for one unit of a line, frozen at checkout. */
export interface OrderSnapshotCard {
  virtualId: string | null
  cardId: string | null
  cardType: OrderSnapshotCardType | string | null
  formType: OrderSnapshotFormType | string | null
  messageContent: string | null
  attachedImageUrl: string | null
  cardTemplate: OrderSnapshotCardTemplate | null
  cardSize: OrderSnapshotCardSize | null
  /**
   * The price tier the words fell into when the order was paid for. Staying inside it is what
   * keeps the card at the price already charged, so it caps the rewrite tighter than the size does.
   */
  cardConfig: OrderSnapshotCardConfig | null
  /** Words counted at checkout - `cardConfig` is the tier they landed in. */
  wordCount: number | null
  /** Units this one card covers - 1 per metadata entry in every sample so far. */
  quantity: number | null
  basePrice: number | null
  extraPrice: number | null
  totalPrice: number | null
  /** `'not yet'` until the artwork is generated. */
  status: string | null
  /** TODO(backend): where the generated artwork lands; empty while `status` is `'not yet'`. */
  idResult: string[] | null
  finalGeneratedCardId: string | null
}

/**
 * One *unit* of a line: an item bought twice carries two entries, each with its own card.
 * The API also snapshots the bouquet itself here (`materials`, `ribbon`, `wrappingPaper`,
 * `generatedFlower`, `aiCustomize`); none of it is shown to the customer, so none of it is typed.
 */
export interface OrderProductMetadata {
  name: string | null
  subId: string | null
  snapShotCard: OrderSnapshotCard | null
}

export interface OrderItemSnapshot {
  productMetadata: OrderProductMetadata[] | null
}

export interface OrderItem {
  orderDetailsId: string
  name: string
  /** TODO(backend): typed as a string but the order response sends the Nhanh id as a number. Nothing reads it yet. */
  itemId: string
  number: number
  price: number
  weight: number
  length: number
  width: number
  height: number
  productId: string
  coverImage: string | null
  parentProductId: string | null
  parentProductName: string | null
  /** Absent on older orders - a line with no snapshot simply has no cards. */
  snapshot: OrderItemSnapshot | null
}

/**
 * One generated artwork of an order card - a row of `GET v1/order-details/{orderDetailsId}/cards`.
 * Each row carries the design and the words that generation was painted from, so two generations
 * of the same card can differ in more than the picture.
 */
export interface OrderDetailCardItem {
  id: string
  name: string
  imageUrl: string
  formType: OrderSnapshotFormType
  messageContent: string
  templateId: string
}

export interface OrderDetailCardsResponse {
  cards: OrderDetailCardItem[]
}

export interface GetOrderDetailCardsParams {
  orderDetailsId: string
  /** Which card of the line - a line carries one per unit bought. */
  virtualId: string
}

/**
 * Body of `POST v1/ai-cards` - regenerating one card of a placed order. Note the singular
 * `orderDetailId`, against `orderDetailsId` everywhere else in the order payload.
 */
export interface RegenerateAiCardPayload {
  orderDetailId: string
  virtualId: string
  sourceCardId: string | null
  cardTemplateId: string | null
  messageContent: string | null
}

/**
 * Body of `PUT v1/ai-cards/final-generated-card` - the generation the customer wants printed.
 * It lands on `snapShotCard.finalGeneratedCardId` of that one card.
 */
export interface SetFinalGeneratedCardPayload {
  orderDetailId: string
  virtualId: string
  generatedCardId: string
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

export interface EstimateItemPayload {
  itemId: string
  productId: string
  number: number
}

export interface EstimatePayload {
  latitude: number
  longitude: number
  address: string
  shortAddress: string
  fullName: string
  phone: string
  remarks: string
  orderTime: number
  items: EstimateItemPayload[]
  tagIds: number[]
}

/**
 * `GeneratedCardType` on the API - the kinds the card-template endpoint spells `'ai'` and
 * `'handmade'`. A reused card is an AI card; `sourceGeneratedCardId` is what marks it reused.
 */
export const OrderCardType = {
  Ai: 0,
  Handmade: 1
} as const

export type OrderCardType = (typeof OrderCardType)[keyof typeof OrderCardType]

/** `CardFormType` on the API. The UI calls these two `typed` and `handwritten`. */
export const OrderCardFormType = {
  GoMay: 0,
  Calligraphy: 1
} as const

export type OrderCardFormType = (typeof OrderCardFormType)[keyof typeof OrderCardFormType]

export interface OrderCardPayload {
  cardType: OrderCardType
  /** Empty for a reused card - it brings its own artwork. */
  cardTemplateId: string | null
  /** `CardSize.name` from `card_config.sizes` - empty for the free standard card. */
  sizeName: string
  formType: OrderCardFormType
  messageContent: string
  attachedImageUrl: string | null
  /** TODO(backend): the reused generation's id comes from the card API; not wired yet. */
  sourceGeneratedCardId: string | null
}

export interface OrderBouquetPayload {
  /** Only set for a bouquet designed in the studio - the version the cart line was bought from. */
  generatedFlowerId?: string
  /**
   * `null` for a unit that carries no card. Only a studio bouquet sends one of these - it has
   * to name its design whether or not anything is printed for it.
   */
  card: OrderCardPayload | null
}

export interface CheckoutItemPayload extends EstimateItemPayload {
  bouquets: OrderBouquetPayload[]
}

export interface EstimateResult {
  quotes: ShippingQuote[]
  products: EstimateProduct[]
}

export interface CheckoutPayload extends Omit<EstimatePayload, 'items'> {
  items: CheckoutItemPayload[]
  fullNameReceiver: string
  phoneReceiver: string
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
  paymentGateway: PaymentGatewayCode
  shippingGateway: ShippingGateway
  shippingFee: number
}

export interface CheckoutSelection {
  paymentMethod: PaymentMethod
  gateway: PaymentGateway
  shippingGateway: ShippingGateway
  shippingFee: number
}

export interface UpdateShippingRequest {
  orderId: string
  shippingTrackingUrl?: string | null
  trackingNumber?: string | null
  shippingFee?: number | null
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
  ward: string
  city: string
}

export interface GeocodeResponse {
  result: GeocodeResult | null
}

export interface GeocodeReverseResult {
  latitude: number
  longitude: number
  mapId: string
  addressLine: string
  ward: string
  city: string
}

export interface GeocodeReverseResponse {
  result: GeocodeReverseResult | null
}
