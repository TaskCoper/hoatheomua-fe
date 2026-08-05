import 'server-only'

import { CACHE_LIFE } from '@/lib/cache-life'
import { getQueryClient } from '@/lib/react-query-client'
import { isAxiosError } from 'axios'
import { cacheLife, cacheTag } from 'next/cache'
import type { GetProductsParams } from './hooks/use-get-products'
import { fetchProductDetail, productListQuery } from './queries'
import productService from './services'

export const PRODUCTS_CACHE_TAG = 'products'

export async function getCachedProducts(params: GetProductsParams) {
  'use cache'
  cacheLife(CACHE_LIFE.list)
  cacheTag(PRODUCTS_CACHE_TAG)

  return productService.getProducts(params)
}

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

export async function getProductDetail(id: string) {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag(PRODUCTS_CACHE_TAG)

  try {
    return await fetchProductDetail(id)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}
