'use client'

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { productSummaryQuery } from '../queries'
import type { ProductSummary } from '../types'

export interface ProductSummaryState {
  product: ProductSummary | null
  isResolving: boolean
}

/**
 * Batched, lightweight product data for pages that only render a name, image,
 * price and stock per line (cart, order review) - avoids pulling the full
 * `ProductDetail` payload per id the way `productDetailQuery` does.
 */
export const useGetProductSummary = ({ productIds }: { productIds: string[] }) => {
  const queries = useQueries({
    queries: productIds.map((id) => productSummaryQuery(id))
  })

  const productSummaryById = useMemo(() => {
    const map = new Map<string, ProductSummaryState>()
    productIds.forEach((id, index) => {
      const query = queries[index]
      map.set(id, {
        product: query?.data ?? null,
        isResolving: !query || query.isLoading
      })
    })
    return map
  }, [productIds, queries])

  return { productSummaryById }
}
