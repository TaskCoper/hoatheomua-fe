// TODO(backend): there is no card service yet, so these shapes describe only what the
// checkout UI needs. Replace with the API types once the card endpoints exist.

export type CardWritingMethod = 'typed' | 'handwritten'

export interface CardContent {
  message: string
}

/**
 * Snapshot of the picked template. Only the id is sent; the name and artwork are kept so the
 * summary never fetches the template back, and still shows what was picked after the CMS
 * deactivates it.
 */
export interface CheckoutCardTemplate {
  templateId: string
  templateName: string
  templateImageUrl: string
}

export interface GeneratedCard {
  id: string
  templateId: string
  templateName: string
  /** `CardSize.name` from `card_config.sizes`. */
  sizeName: string
  writingMethod: CardWritingMethod
  content: CardContent
  imageUrl: string
  createdAt: string
}

interface CheckoutCardBase {
  lineId: string
  quantity: number
}

/**
 * The complimentary card that ships with its product. It is free, so there is no size to
 * pick - the quantity is capped by how many units of that product the order carries.
 */
export interface StandardCheckoutCard extends CheckoutCardBase, CheckoutCardTemplate {
  type: 'standard'
  content: CardContent
}

/**
 * An AI card for one checkout line. The artwork is generated after the order is placed,
 * hence no generation id here. A line carries at most one AI or history card, never both.
 */
export interface AiCheckoutCard extends CheckoutCardBase, CheckoutCardTemplate {
  type: 'ai'
  /** `CardSize.name` from `card_config.sizes`. */
  sizeName: string
  writingMethod: CardWritingMethod
  content: CardContent
  /** Uploaded only once the order is placed, so an abandoned checkout uploads nothing. */
  attachedImage: File | null
  /** Filled in from `attachedImage` on the way to the payload; `''` in form state. */
  attachedImageUrl: string
}

export interface HistoryCheckoutCard extends CheckoutCardBase {
  type: 'history'
  generatedCardId: string
  /** Copied from the generation being reused. */
  sizeName: string
  content: CardContent
  writingMethod: CardWritingMethod
}

export type CheckoutCard = StandardCheckoutCard | AiCheckoutCard | HistoryCheckoutCard

/**
 * Post-checkout: one AI artwork generated for a card of a placed order. The words are
 * part of the version because the artwork is painted from them - editing the words means
 * generating again.
 */
export interface OrderCardVersion {
  id: string
  label: number
  imageUrl: string
  content: CardContent
  createdAt: string
}

/**
 * An AI card that travels with a line of a placed order. Design and size were paid for at
 * checkout, so they are frozen; the words, the writing method and the chosen version are not.
 * TODO(backend): no order-card endpoint yet - see `buildMockOrderAiCards`.
 */
export interface OrderAiCard {
  id: string
  /** The `OrderItem.orderDetailsId` this card is printed for. */
  orderDetailsId: string
  productName: string
  productImageUrl: string | null
  /** Frozen at checkout. */
  templateId: string
  templateName: string
  templateImageUrl: string
  /** Frozen at checkout. */
  sizeName: string
  quantity: number
  /** Unit price charged at checkout, used to show the difference an edit makes. */
  paidUnitPrice: number
  writingMethod: CardWritingMethod
  selectedVersionId: string
  versions: OrderCardVersion[]
}

export type CheckoutCardType = CheckoutCard['type']

/**
 * The kinds whose artwork is designed rather than picked from a template. A product carries
 * only one of the two, so its cards never mix an AI design with a reused one.
 */
export type GeneratedCardType = Exclude<CheckoutCardType, 'standard'>

export type CheckoutCardField = CheckoutCard & { id: string }
