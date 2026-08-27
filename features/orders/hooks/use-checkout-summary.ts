import { useGetProductSummary } from '@/features/products/hooks/use-get-product-summary'
import { useGetProductsSellableQuantity } from '@/features/products/hooks/use-get-products-sellable-quantity'
import { toSellableQuantity } from '@/features/products/stock'
import type { CartItem } from '@/stores/cart.store'
import { useMemo } from 'react'
import type { CheckoutLineIssue, CheckoutSummaryLine } from '../components/checkout/checkout-sidebar'

interface UseCheckoutSummaryArgs {
  items: CartItem[]
  hasTaxCode: boolean
  shippingFee: number
}

export const useCheckoutSummary = ({ items, hasTaxCode, shippingFee }: UseCheckoutSummaryArgs) => {
  const productIds = useMemo(() => Array.from(new Set(items.map((item) => item.productId))), [items])
  const { productSummaryById } = useGetProductSummary({ productIds })

  // Checkout is entered with a stock verdict taken back on the cart, and a buyer can
  // sit on this page for minutes. Stock is re-read on mount and on window focus so a
  // product that sold out or was switched off meanwhile surfaces before payment.
  const { sellableQuantities, sellableQuantityById } = useGetProductsSellableQuantity({ productIds })

  // `sellableQuantityById` already reports an inactive product as 0, which is right
  // for arithmetic but reads as "sold out" - the raw rows keep the two apart so the
  // line can say which one it is.
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

        // A line still loading is not a problem yet, and a product the stock endpoint
        // said nothing about is unknown rather than sold out - blocking on either
        // would turn a slow response into a dead checkout.
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
                  : null

        return {
          lineId: item.lineId,
          name: product?.parent?.productName ?? product?.productName ?? `#${item.productId}`,
          variantName: product?.parent ? product.productName : null,
          image: product?.coverImage ?? null,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
          issue,
          available
        }
      }),
    [items, productSummaryById, sellableQuantityById, inactiveIds]
  )

  const unavailableLines = useMemo(() => summaryLines.filter((line) => line.issue !== null), [summaryLines])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const productsSubtotal = summaryLines.reduce((sum, line) => sum + line.subtotal, 0)
  const vatAmount = hasTaxCode ? Math.round(productsSubtotal * 0.08) : 0
  const grandTotal = productsSubtotal + vatAmount + shippingFee

  return {
    summaryLines,
    unavailableLines,
    hasUnavailableLines: unavailableLines.length > 0,
    totalItems,
    productsSubtotal,
    vatAmount,
    grandTotal
  }
}
