import 'server-only'

import { getQueryClient } from '@/lib/react-query-client'
import { cache } from 'react'
import { fetchProductDetail, productListQuery } from './queries'
import type { ProductListResponse } from './types'

/**
 * Returns the most-recent product IDs as strings, suitable for
 * `generateStaticParams`. Falls back to an empty list on any failure so the
 * build still succeeds; long-tail detail pages are served on-demand by ISR.
 *
 * Server-only by virtue of being a side-effect of the server-side axios client.
 */
export async function getAllProductIds(limit = 50): Promise<string[]> {
  try {
    const qc = getQueryClient()
    const response: ProductListResponse = await qc.fetchQuery(productListQuery({ size: limit }, 'vi'))
    const items = response.value?.data ?? []
    return items.map((product) => String(product.id))
  } catch {
    return []
  }
}

/**
 * React `cache()`-deduped product detail fetcher. Used by both
 * `generateMetadata` and the page so a single backend call serves the whole
 * render pass; the returned envelope is then hydrated into the query client via
 * `setQueryData(productDetailQuery(id, locale).queryKey, envelope)`.
 */
export const getProductDetail = cache(async (id: string, locale: string) => {
  try {
    return await fetchProductDetail(id, locale)
  } catch {
    return null
  }
})
