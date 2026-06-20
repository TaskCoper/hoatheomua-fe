import { DEFAULT_PRODUCT_CATEGORY_IDS, DEFAULT_PRODUCT_SORT } from '@/features/products/constants'
import type { Product, ProductDetail } from '@/features/products/types'
import type { BaseResponse } from '@/lib/axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')

export interface ProductListPayload {
  code: number
  data: Product[]
  paginator: {
    next: {
      id: number
    }
  }
}

export interface FetchProductsParams {
  ids?: number[]
  status?: number[]
  categoryIds?: number[]
  price?: number[]
  size?: number
  sort?: Record<string, 'asc' | 'desc'>
  next?: Record<string, number>
}

interface FetchOptions {
  /**
   * Revalidate window in seconds for Next.js Data Cache. Defaults to 3600.
   */
  revalidate?: number
}

async function postProductApi<T>(path: string, body: unknown, options: FetchOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
  }

  const response = await fetch(`${API_BASE_URL}/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body),
    next: { revalidate: options.revalidate ?? 3600 }
  })

  if (!response.ok) {
    throw new Error(`Product API request failed (${response.status}) for ${path}`)
  }

  return (await response.json()) as T
}

export const fetchProductById = (id: string, options?: FetchOptions) =>
  postProductApi<BaseResponse<{ code: number; data: ProductDetail }>>(
    'v1/products/nhanh-vn/details',
    { filters: { id } },
    options
  )

/**
 * Fetches a product detail and unwraps to `ProductDetail | null`, matching the
 * client-side `useGetProduct` hook's return shape so the same value can populate
 * the React Query cache via `setQueryData`.
 */
export const fetchProductDetailById = async (id: string, options?: FetchOptions): Promise<ProductDetail | null> => {
  const response = await fetchProductById(id, options)
  return response.value?.data ?? null
}

export const fetchProductsList = (params: FetchProductsParams = {}, options?: FetchOptions) =>
  postProductApi<BaseResponse<ProductListPayload>>(
    'v1/products/nhanh-vn/list',
    {
      filters: {
        ids: params.ids ?? [],
        status: params.status ?? [],
        categoryIds: params.categoryIds ?? DEFAULT_PRODUCT_CATEGORY_IDS
      },
      paginator: {
        size: params.size ?? 12,
        sort: params.sort ?? DEFAULT_PRODUCT_SORT,
        ...(params.next ? { next: params.next } : {})
      }
    },
    options
  )

/**
 * Returns the most-recent product IDs as strings, suitable for `generateStaticParams`.
 * Falls back to an empty list on any failure so the build still succeeds (long-tail
 * detail pages are served on-demand via ISR).
 */
export const fetchTopProductIds = async (limit = 50, options?: FetchOptions): Promise<string[]> => {
  try {
    const response = await fetchProductsList({ size: limit }, options)
    const items = response.value?.data ?? []
    return items.map((product) => String(product.id))
  } catch {
    return []
  }
}
