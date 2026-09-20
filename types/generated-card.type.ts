/**
 * A card artwork the customer has already generated, as the generated-card API returns it.
 * `formType` carries the same two codes as `OrderCardFormType` in `features/orders/types.ts`;
 * `features/orders/cards/card-data.ts` maps a row onto the `GeneratedCard` the checkout draws.
 *
 * TODO(backend): the row shape is unverified - only `id`, `imageUrl` and `messageContent` are
 * read as required; the rest is normalised defensively by `toGeneratedCard`.
 */
export interface GeneratedCardItem {
  id: string
  cardTemplateId?: string | null
  cardTemplateName?: string | null
  /** `CardSize.name` from `card_config.sizes`. */
  sizeName?: string | null
  formType?: number | null
  messageContent?: string | null
  imageUrl?: string | null
  createdAt?: string | null
}

/**
 * Body of `POST v1/generated-cards/by-products` - the card-template list params, plus the
 * products whose cards are wanted. The endpoint takes them in the body rather than the query
 * because `productIds` is a list.
 */
export interface GetGeneratedCardsByProductsPayload {
  pageIndex?: number
  pageSize?: number
  search?: string
  productIds: string[]
}
