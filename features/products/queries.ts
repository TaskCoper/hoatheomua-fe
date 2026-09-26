import { queryOptions } from '@tanstack/react-query'
import type { GetProductsParams } from './hooks/use-get-products'
import productService from './services'

export const productListQuery = (params: GetProductsParams) =>
  queryOptions({
    queryKey: ['products', { params }] as const,
    queryFn: () => productService.getProducts(params)
  })

export const fetchProductDetail = (id: string) => productService.getProduct({ id })

export const productDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['product', id] as const,
    queryFn: () => fetchProductDetail(id)
  })

export const productSummaryQuery = (id: string) =>
  queryOptions({
    queryKey: ['product-summary', id] as const,
    queryFn: () => productService.getProductSummary({ id })
  })

/** Shared prefix so a stock re-check can patch every cached sellable-quantity list at once. */
export const SELLABLE_QUANTITY_QUERY_PREFIX = ['products', 'sellable-quantity'] as const

// Ids are sorted so two callers asking for the same set share one cache entry
// regardless of the order the cart happens to hold them in.
export const sellableQuantityQueryKey = (productIds: string[]) =>
  [...SELLABLE_QUANTITY_QUERY_PREFIX, [...productIds].sort()] as const

// Stock moves constantly and the pages that read it are statically rendered, so
// this never serves a stale number without going back to the API.
export const sellableQuantityQuery = (productIds: string[]) =>
  queryOptions({
    queryKey: sellableQuantityQueryKey(productIds),
    queryFn: () => productService.getProductsSellableQuantity({ productIds }),
    staleTime: 0,
    gcTime: 60_000
  })
