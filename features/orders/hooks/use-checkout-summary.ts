import { useGetProductSummary } from '@/features/products/hooks/use-get-product-summary'
import { useGetProductsSellableQuantity } from '@/features/products/hooks/use-get-products-sellable-quantity'
import { toSellableQuantity } from '@/features/products/stock'
import { useGetFlowerCompositions } from '@/features/studio/hooks/use-get-flower-composition'
import type { CartItem } from '@/stores/cart.store'
import { useMemo } from 'react'
import type { CheckoutLineIssue, CheckoutSummaryLine } from '../components/checkout/checkout-sidebar'
import { calculateVat } from '../vat'

const NO_BLOCKED_PRODUCTS: ReadonlySet<string> = new Set()

interface UseCheckoutSummaryArgs {
  items: CartItem[]
  hasTaxCode: boolean
  shippingFee: number
  cardsTotal?: number
  /** What the selected voucher takes off the products; VAT is charged after it. */
  voucherDiscount?: number
  /** Products the last check-core verdict blamed for a material shortage. */
  materialBlockedProductIds?: ReadonlySet<string>
}

export const useCheckoutSummary = ({
  items,
  hasTaxCode,
  shippingFee,
  cardsTotal = 0,
  voucherDiscount = 0,
  materialBlockedProductIds = NO_BLOCKED_PRODUCTS
}: UseCheckoutSummaryArgs) => {
  const productIds = useMemo(() => Array.from(new Set(items.map((item) => item.productId))), [items])

  // A studio bouquet is named and pictured by its composition, not by the catalogue
  // row it is assembled from - that row only carries its stock.
  const catalogueProductIds = useMemo(
    () => Array.from(new Set(items.filter((item) => !item.aiFlower).map((item) => item.productId))),
    [items]
  )
  const flowerIds = useMemo(
    () => items.flatMap((item) => (item.aiFlower ? [item.aiFlower.generatedFlowerId] : [])),
    [items]
  )

  const { productSummaryById } = useGetProductSummary({ productIds: catalogueProductIds })
  const { compositionByFlowerId } = useGetFlowerCompositions({ flowerIds })

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
        const aiFlower = item.aiFlower
        const compositionState = aiFlower ? compositionByFlowerId.get(aiFlower.generatedFlowerId) : undefined
        const composition = compositionState?.composition ?? null

        const state = aiFlower ? undefined : productSummaryById.get(item.productId)
        const product = state?.product ?? null

        const isResolving = aiFlower ? (compositionState?.isResolving ?? true) : (state?.isResolving ?? true)
        const exists = aiFlower ? Boolean(composition) : Boolean(product)
        // The composition prices nothing: a design costs what the studio quoted.
        const unitPrice = aiFlower ? aiFlower.unitPrice : (product?.price ?? 0)

        const liveStock = sellableQuantityById.get(item.productId)
        const rawStock = liveStock ?? (aiFlower ? undefined : product?.sellableQuantity)
        const isStockKnown = typeof rawStock === 'number' && Number.isFinite(rawStock)
        const available = isStockKnown ? toSellableQuantity(rawStock) : null

        const issue: CheckoutLineIssue | null = isResolving
          ? null
          : !exists
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
          name: aiFlower
            ? (composition?.name?.trim() ?? '')
            : (product?.parent?.productName ?? product?.productName ?? ''),
          variantName: aiFlower ? null : product?.parent ? product.productName : null,
          image: aiFlower ? composition?.coverImage || null : (product?.coverImage ?? null),
          trims: [aiFlower?.ribbon, aiFlower?.wrap].flatMap((trim) => (trim?.name ? [trim.name] : [])),
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
          isResolving,
          issue,
          available
        }
      }),
    [items, productSummaryById, compositionByFlowerId, sellableQuantityById, inactiveIds, materialBlockedProductIds]
  )

  const unavailableLines = useMemo(() => summaryLines.filter((line) => line.issue !== null), [summaryLines])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const productsSubtotal = summaryLines.reduce((sum, line) => sum + line.subtotal, 0)
  // A voucher discounts the products only, so it can never take more than they cost.
  const appliedVoucherDiscount = Math.min(Math.max(0, voucherDiscount), productsSubtotal)
  const { taxableAmount, vatAmount } = calculateVat({
    vatApplicableAmount: productsSubtotal,
    voucherDiscount: appliedVoucherDiscount,
    isSubjectToVat: hasTaxCode
  })
  const grandTotal = productsSubtotal - appliedVoucherDiscount + vatAmount + shippingFee + cardsTotal

  return {
    summaryLines,
    unavailableLines,
    hasUnavailableLines: unavailableLines.length > 0,
    totalItems,
    productsSubtotal,
    appliedVoucherDiscount,
    taxableAmount,
    vatAmount,
    cardsTotal,
    grandTotal
  }
}
