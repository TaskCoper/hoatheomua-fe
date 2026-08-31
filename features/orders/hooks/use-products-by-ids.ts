import { productSummaryQuery } from '@/features/products/queries'
import type { ProductSummary } from '@/features/products/types'
import type { CartItem } from '@/stores/cart.store'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

export const useProductsByIds = (items: CartItem[]) => {
  const productIds = useMemo(() => Array.from(new Set(items.map((item) => item.productId))), [items])
  const productQueries = useQueries({
    queries: productIds.map((id) => productSummaryQuery(id))
  })

  return useMemo(() => {
    const map = new Map<string, ProductSummary>()
    productIds.forEach((id, index) => {
      const product = productQueries[index]?.data
      if (product) map.set(id, product)
    })
    return map
  }, [productIds, productQueries])
}
