import 'server-only'

import { getQueryClient } from '@/lib/react-query-client'
import { isAxiosError } from 'axios'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { GetProductsParams } from './hooks/use-get-products'
import { fetchProductDetail, productListQuery } from './queries'
import productService from './services'
import type { ProductDetail } from './types'

export const PRODUCTS_CACHE_TAG = 'products'

// Prefetched by products/page.tsx, the home page, and every mainline/featured/
// occasion detail page's section grids - matches their own 300s ISR window
// (product price/stock is the freshest-changing data on the site, hence
// shorter than the 3600s convention used elsewhere) rather than clipping it.
export const getCachedProducts = (params: GetProductsParams) =>
  unstable_cache(() => productService.getProducts(params), ['products-list', JSON.stringify(params)], {
    tags: [PRODUCTS_CACHE_TAG],
    revalidate: 300
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

export const getProductDetail = cache(
  (id: string): Promise<ProductDetail | null> =>
    unstable_cache(
      async () => {
        try {
          return await fetchProductDetail(id)
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) return null
          throw error
        }
      },
      ['product-detail', id],
      { tags: [PRODUCTS_CACHE_TAG], revalidate: 3600 }
    )()
)
