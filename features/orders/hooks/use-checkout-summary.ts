import type { CartItem } from '@/stores/cart.store'
import { useMemo } from 'react'
import type { CheckoutSummaryLine } from '../components/checkout/checkout-sidebar'
import { useProductsByIds } from './use-products-by-ids'

interface UseCheckoutSummaryArgs {
  items: CartItem[]
  hasTaxCode: boolean
  shippingFee: number
}

export const useCheckoutSummary = ({ items, hasTaxCode, shippingFee }: UseCheckoutSummaryArgs) => {
  const productById = useProductsByIds(items)

  const summaryLines: CheckoutSummaryLine[] = useMemo(
    () =>
      items.map((item) => {
        const product = productById.get(item.productId)
        const unitPrice = product?.price ?? 0

        return {
          lineId: item.lineId,
          name: product?.productName ?? `#${item.productId}`,
          image: product?.coverImage ?? null,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity
        }
      }),
    [items, productById]
  )

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const productsSubtotal = summaryLines.reduce((sum, line) => sum + line.subtotal, 0)
  const vatAmount = hasTaxCode ? Math.round(productsSubtotal * 0.08) : 0
  const grandTotal = productsSubtotal + vatAmount + shippingFee

  return { summaryLines, totalItems, productsSubtotal, vatAmount, grandTotal }
}
