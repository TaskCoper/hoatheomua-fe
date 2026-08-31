import 'server-only'

import { PRODUCTS_LIST_LIFE, PRODUCT_DETAIL_LIFE } from '@/lib/cache-life'
import { getQueryClient } from '@/lib/react-query-client'
import { isAxiosError } from 'axios'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'
import type { GetProductsParams } from './hooks/use-get-products'
import { fetchProductDetail, productListQuery } from './queries'
import productService from './services'
import type { ProductDetail } from './types'

export const PRODUCTS_CACHE_TAG = 'products'

export async function getCachedProducts(params: GetProductsParams) {
  'use cache'
  cacheTag(PRODUCTS_CACHE_TAG)
  cacheLife(PRODUCTS_LIST_LIFE)

  return productService.getProducts(params)
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
