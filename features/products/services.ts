import api, { localeHeaders } from '@/lib/axios'
import { DEFAULT_PRODUCT_SORT } from './constants'
import type { ProductDetailResponse, ProductListResponse } from './types'

export interface ProductListParams {
  ids?: number[]
  status?: number[]
  categoryIds?: number[]
  name?: string
  price?: number[]
  size?: number
  sort?: Record<string, 'asc' | 'desc'>
  next?: Record<string, number>
}

const buildListBody = (params: ProductListParams) => {
  const trimmedName = params.name?.trim() ?? ''

  return {
    filters: {
      ids: params.ids ?? [],
      status: params.status ?? [],
      categoryIds: params.categoryIds,
      // gpid: -2,
      ...(trimmedName.length > 0 ? { name: trimmedName.toLowerCase() } : {}),
      ...(params.price && params.price.length === 2 ? { price: params.price } : {})
    },
    paginator: {
      size: params.size ?? 12,
      sort: params.sort ?? DEFAULT_PRODUCT_SORT,
      ...(params.next ? { next: params.next } : {})
    }
  }
}

class ProductService {
  private readonly baseUrl = 'products/nhanh-vn'

  getProducts = async ({ locale, ...params }: ProductListParams & { locale: string }) => {
    const { data } = await api.post<ProductListResponse>(`/v1/${this.baseUrl}/list`, buildListBody(params), {
      headers: localeHeaders(locale)
    })

    return data
  }

  getProduct = async ({ id, locale }: { id: string; locale: string }) => {
    const { data } = await api.post<ProductDetailResponse>(
      `/v1/${this.baseUrl}/details`,
      { filters: { id } },
      { headers: localeHeaders(locale) }
    )

    return data
  }
}

const productService = new ProductService()
export default productService
