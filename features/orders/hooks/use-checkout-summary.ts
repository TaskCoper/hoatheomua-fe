import { productDetailQuery } from '@/features/products/queries'
import type { ProductDetail } from '@/features/products/types'
import type { CartItem } from '@/stores/cart.store'
import { useQueries } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'
import type { CheckoutSummaryLine } from '../components/checkout/checkout-sidebar'

interface UseCheckoutSummaryArgs {
  items: CartItem[]
  hasTaxCode: boolean
  shippingFee: number
}

export const useCheckoutSummary = ({ items, hasTaxCode, shippingFee }: UseCheckoutSummaryArgs) => {
  const locale = useLocale()

  const productIds = useMemo(() => Array.from(new Set(items.map((item) => item.productId))), [items])
  const productQueries = useQueries({
    queries: productIds.map((id) => productDetailQuery(String(id), locale))
  })

  const productById = useMemo(() => {
    const map = new Map<number, ProductDetail>()
    productIds.forEach((id, index) => {
      const product = productQueries[index]?.data?.value?.data as ProductDetail | undefined
      if (product) map.set(id, product)
    })
    return map
  }, [productIds, productQueries])

  const summaryLines: CheckoutSummaryLine[] = useMemo(
    () =>
      items.map((item) => {
        const product = productById.get(item.productId)
        const unitPrice = product?.prices?.retail ?? 0

        return {
          lineId: item.lineId,
          name: product?.name ?? `#${item.productId}`,
          image: product?.images?.avatar ?? null,
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
