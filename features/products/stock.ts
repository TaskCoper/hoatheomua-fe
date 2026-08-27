import type { ProductDetail, ProductSellableQuantity } from './types'

/**
 * Stock is `sellableQuantity` and nothing else. Every read goes through here so a
 * null, a fractional value, or a negative from the warehouse sheet lands on the
 * same integer floor of 0.
 */
export const toSellableQuantity = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0

export const buildSellableQuantityMap = (rows: ProductSellableQuantity[] | undefined): Map<string, number> => {
  const map = new Map<string, number>()
  rows?.forEach((row) => {
    // An inactive product is not purchasable regardless of leftover stock, so it
    // reads as sold out everywhere this map feeds - display, add to cart, checkout.
    if (row?.id) map.set(row.id, row.isActive ? toSellableQuantity(row.sellableQuantity) : 0)
  })
  return map
}

/**
 * Overlays freshly fetched stock onto a product row and its variant children.
 * Returns the very same object when nothing moved - the product page renders from
 * statically generated HTML, so an unconditional copy would re-render the whole
 * purchase box on every refetch.
 */
export const withLiveStock = (product: ProductDetail, quantityById: Map<string, number>): ProductDetail => {
  if (quantityById.size === 0) return product

  const children = product.children ?? null
  const nextChildren = children?.map((child) => withLiveStock(child, quantityById)) ?? null
  const childrenChanged = children ? children.some((child, index) => child !== nextChildren?.[index]) : false

  const live = quantityById.get(product.id)
  const quantityChanged = live !== undefined && live !== product.sellableQuantity

  if (!childrenChanged && !quantityChanged) return product

  return {
    ...product,
    sellableQuantity: quantityChanged ? live : product.sellableQuantity,
    children: childrenChanged ? nextChildren : children
  }
}
