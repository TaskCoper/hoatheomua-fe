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

/**
 * The two kinds `GET v1/generated-cards` spells - an AI card is designed here, a handmade one
 * is written by our florist.
 */
export type GeneratedCardKind = 'ai' | 'handmade'

/**
 * One row of the account's card history, as `GET v1/generated-cards` returns it. Unlike
 * `GeneratedCard` - the reuse gallery's shape - it carries no template, and brings the
 * printed size and the price the generation was charged at.
 */
export interface GeneratedCardHistoryEntry {
  id: string
  kind: GeneratedCardKind
  /** `CardSize.name` from `card_config.sizes`. */
  sizeName: string
  /** Printed size in centimetres; `null` when the API sends nothing to print at. */
  sizeWidth: number | null
  sizeHeight: number | null
  writingMethod: CardWritingMethod
  content: CardContent
  imageUrl: string
  /** The artwork before the words were laid over it; `''` when the API kept none. */
  rawImageUrl: string
  /** The photo the customer attached to the generation; `''` when there was none. */
  attachedImageUrl: string
  totalPrice: number
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
  /**
   * Snapshot of that generation's artwork. The gallery only holds the cards of the product
   * being carded, so the summary would otherwise lose the preview as soon as the composer
   * closes - and it still shows what was picked if the generation is later removed.
   */
  templateName: string
  imageUrl: string
  content: CardContent
  writingMethod: CardWritingMethod
}

export type CheckoutCard = StandardCheckoutCard | AiCheckoutCard | HistoryCheckoutCard

/**
 * Post-checkout: one artwork generated for a card of a placed order, as
 * `GET v1/order-details/{id}/cards` returns it. The endpoint gives an id, a name and the
 * image - the words a version was painted from do not come back with it.
 */
export interface OrderCardVersion {
  id: string
  /** Position in the list, for the "Version n" labels the API does not provide. */
  label: number
  name: string
  imageUrl: string
}

/**
 * A card that travels with a line of a placed order, read off the line's checkout snapshot.
 * Design and size were paid for at checkout, so they are frozen; the words, the writing
 * method and the chosen version are not.
 */
export interface OrderAiCard {
  /** `snapShotCard.virtualId` - the card's identity in both card endpoints. */
  id: string
  /** The `OrderItem.orderDetailsId` this card is printed for. */
  orderDetailsId: string
  sourceCardId: string | null
  /** Only an `'ai'` card is designed here - a handmade one is written by our florist. */
  type: 'ai' | 'handmade'
  productName: string
  productImageUrl: string | null
  /** The design ordered - the one thing about the artwork the customer may still change. */
  templateId: string
  templateName: string
  templateImageUrl: string
  /** Frozen at checkout. */
  sizeName: string
  /**
   * Width over height of the size ordered - what the card is actually printed at, and the
   * shape to hold a preview in until the artwork itself has been measured.
   */
  sizeRatio: number | null
  /** Which unit of the line this card belongs to, counting from 1. */
  unit: number
  /** The words ordered, and the budget they have to stay inside to keep the paid price. */
  content: CardContent
  minWords: number
  maxWords: number
  /** Unit price charged at checkout. */
  paidUnitPrice: number
  /** Frozen at checkout - printed or handwritten is not part of the redesign. */
  writingMethod: CardWritingMethod
  /** `snapShotCard.finalGeneratedCardId` - the version that goes to print, once one is chosen. */
  selectedVersionId: string
}

export type CheckoutCardType = CheckoutCard['type']

/**
 * The kinds whose artwork is designed rather than picked from a template. A product carries
 * only one of the two, so its cards never mix an AI design with a reused one.
 */
export type GeneratedCardType = Exclude<CheckoutCardType, 'standard'>

export type CheckoutCardField = CheckoutCard & { id: string }
