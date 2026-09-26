import 'server-only'

import { PRODUCTS_LIST_LIFE, PRODUCT_DETAIL_LIFE } from '@/lib/cache-life'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import type { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'
import { infiniteProductsQuery } from './hooks/use-get-infinite-products'
import type { GetProductsParams } from './hooks/use-get-products'
import { fetchProductDetail, productListQuery } from './queries'
import productService from './services'
import type { CarouselProductsParams } from './section-defaults'
import type { ProductDetail } from './types'

export const PRODUCTS_CACHE_TAG = 'products'

export async function getCachedProducts(params: GetProductsParams) {
  'use cache'
  cacheTag(PRODUCTS_CACHE_TAG)
  cacheLife(PRODUCTS_LIST_LIFE)

  return productService.getProducts(params)
}

/**
 * Seeds page one of a carousel's infinite query so the opening slides are inside the
 * rendered HTML. Only the first page - the window walks itself from there, on the client.
 */
export async function prefetchCarouselProducts(queryClient: QueryClient, params: CarouselProductsParams) {
  // `maxPages` is a cache-shape knob, not a request param - it must not reach the API.
  const { maxPages, ...listParams } = params
  void maxPages
  const firstPage = await getCachedProducts({ ...listParams, pageIndex: DEFAULT_PAGE_INDEX })

  queryClient.setQueryData(infiniteProductsQuery(params).queryKey, {
    pages: [firstPage],
    pageParams: [DEFAULT_PAGE_INDEX]
  })
}

export async function getAllProductIds(limit = 20): Promise<string[]> {
  try {
    const qc = getQueryClient()
    const response = await qc.fetchQuery(productListQuery({ pageSize: limit }))
    return response.value.items.map((product) => product.id)
  } catch {
    return []
  }
}

const SITEMAP_PAGE_SIZE = 100
const SITEMAP_MAX_PRODUCTS = 20_000

export async function getAllProductIdsForSitemap(): Promise<string[]> {
  'use cache'
  cacheTag(PRODUCTS_CACHE_TAG)
  cacheLife(PRODUCT_DETAIL_LIFE)

  const ids: string[] = []
  let pageIndex = 1

  try {
    while (ids.length < SITEMAP_MAX_PRODUCTS) {
      const page = await productService.getProducts({ pageIndex, pageSize: SITEMAP_PAGE_SIZE })

      for (const product of page.value.items) {
        ids.push(product.id)
      }

      if (!page.value.hasNextPage) break
      pageIndex += 1
    }
  } catch (error) {
    console.error('[SSR] product id enumeration failed:', error)
    return ids
  }

  return ids
}

async function getProductDetailCached(id: string): Promise<ProductDetail | null> {
  'use cache'
  cacheTag(PRODUCTS_CACHE_TAG)
  cacheLife(PRODUCT_DETAIL_LIFE)

  try {
    return await fetchProductDetail(id)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export const getProductDetail = cache(getProductDetailCached)
