import type { OrderItem, OrderSummaryItem } from '../types'

/**
 * The list and detail endpoints describe a line item differently, so both are
 * flattened into this view before rendering.
 */
export interface OrderLine {
  id: string
  name: string
  coverImage: string | null
  quantity: number
  price: number
  productId: string | null
  parentProductId: string | null
  parentProductName: string | null
}

export type OrderLineSource = OrderItem | OrderSummaryItem

export function normalizeOrderLine(item: OrderLineSource): OrderLine {
  if ('orderDetailsId' in item) {
    return {
      id: item.orderDetailsId,
      name: item.name,
      coverImage: item.coverImage,
      quantity: item.number,
      price: item.price,
      productId: item.productId || null,
      parentProductId: item.parentProductId,
      parentProductName: item.parentProductName
    }
  }

  // `parent` was null in every sampled list response, so its keys are a best guess.
  // Reading them optionally means a mismatch degrades to a plain product link
  // instead of throwing - check a live variant order before trusting it.
  return {
    id: item.productId,
    name: item.name,
    coverImage: item.coverImage,
    quantity: item.quantity,
    price: item.price,
    productId: item.productId || null,
    parentProductId: item.parent?.productId || null,
    parentProductName: item.parent?.name || null
  }
}
