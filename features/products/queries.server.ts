import 'server-only'

import { getQueryClient } from '@/lib/react-query-client'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { GetProductsParams } from './hooks/use-get-products'
import { fetchProductDetail, productListQuery } from './queries'
import productService from './services'

export const PRODUCTS_CACHE_TAG = 'products'

export const getCachedProducts = (params: GetProductsParams) =>
  unstable_cache(() => productService.getProducts(params), ['products-list', JSON.stringify(params)], {
    tags: [PRODUCTS_CACHE_TAG],
    revalidate: 60
  })()

/**
 * Returns the most-recent product IDs as strings, suitable for
 * `generateStaticParams`. Falls back to an empty list on any failure so the
 * build still succeeds; long-tail detail pages are served on-demand by ISR.
 *
 * Server-only by virtue of being a side-effect of the server-side axios client.
 */
export async function getAllProductIds(limit = 20): Promise<string[]> {
  try {
    const qc = getQueryClient()
    const response = await qc.fetchQuery(productListQuery({ pageSize: limit }))
    return response.value.items.map((product) => product.id)
  } catch {
    return []
  }
}

/**
 * React `cache()`-deduped product detail fetcher. Used by both
 * `generateMetadata` and the page so a single backend call serves the whole
 * render pass; the returned product is then hydrated into the query client via
 * `setQueryData(productDetailQuery(id).queryKey, product)`.
 */
export const getProductDetail = cache(async (id: string) => {
  try {
    return await fetchProductDetail(id)
  } catch {
    return null
  }
})
