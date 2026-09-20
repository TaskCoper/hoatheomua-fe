import { useGetProductSummary } from '@/features/products/hooks/use-get-product-summary'
import { useGetProductsSellableQuantity } from '@/features/products/hooks/use-get-products-sellable-quantity'
import { toSellableQuantity } from '@/features/products/stock'
import type { CartItem } from '@/stores/cart.store'
import { useMemo } from 'react'
import type { CheckoutLineIssue, CheckoutSummaryLine } from '../components/checkout/checkout-sidebar'

const NO_BLOCKED_PRODUCTS: ReadonlySet<string> = new Set()

interface UseCheckoutSummaryArgs {
  items: CartItem[]
  hasTaxCode: boolean
  shippingFee: number
  cardsTotal?: number
  /** Products the last check-core verdict blamed for a material shortage. */
  materialBlockedProductIds?: ReadonlySet<string>
}

export const useCheckoutSummary = ({
  items,
  hasTaxCode,
  shippingFee,
  cardsTotal = 0,
  materialBlockedProductIds = NO_BLOCKED_PRODUCTS
}: UseCheckoutSummaryArgs) => {
  const productIds = useMemo(() => Array.from(new Set(items.map((item) => item.productId))), [items])
  const { productSummaryById } = useGetProductSummary({ productIds })

  const { sellableQuantities, sellableQuantityById } = useGetProductsSellableQuantity({ productIds })

  const inactiveIds = useMemo(() => {
    const ids = new Set<string>()
    sellableQuantities?.forEach((row) => {
      if (row?.id && !row.isActive) ids.add(row.id)
    })
    return ids
  }, [sellableQuantities])

  const summaryLines: CheckoutSummaryLine[] = useMemo(
    () =>
      items.map((item) => {
        const state = productSummaryById.get(item.productId)
        const product = state?.product ?? null
        const isResolving = state?.isResolving ?? true
        const unitPrice = product?.price ?? 0

        const liveStock = sellableQuantityById.get(item.productId)
        const rawStock = liveStock ?? product?.sellableQuantity
        const isStockKnown = typeof rawStock === 'number' && Number.isFinite(rawStock)
        const available = isStockKnown ? toSellableQuantity(rawStock) : null

        const issue: CheckoutLineIssue | null = isResolving
          ? null
          : !product
            ? 'missing'
            : inactiveIds.has(item.productId)
              ? 'inactive'
              : available === 0
                ? 'sold-out'
                : available !== null && item.quantity > available
                  ? 'over-stock'
                  : materialBlockedProductIds.has(item.productId)
                    ? 'materials'
                    : null

        return {
          lineId: item.lineId,
          productId: item.productId,
          name: product?.parent?.productName ?? product?.productName ?? '',
          variantName: product?.parent ? product.productName : null,
          image: product?.coverImage ?? null,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
          isResolving,
          issue,
          available
        }
      }),
    [items, productSummaryById, sellableQuantityById, inactiveIds, materialBlockedProductIds]
  )

  const unavailableLines = useMemo(() => summaryLines.filter((line) => line.issue !== null), [summaryLines])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const productsSubtotal = summaryLines.reduce((sum, line) => sum + line.subtotal, 0)
  const vatAmount = hasTaxCode ? Math.round(productsSubtotal * 0.08) : 0
  const grandTotal = productsSubtotal + vatAmount + shippingFee + cardsTotal

  return {
    summaryLines,
    unavailableLines,
    hasUnavailableLines: unavailableLines.length > 0,
    totalItems,
    productsSubtotal,
    vatAmount,
    cardsTotal,
    grandTotal
  }
}
