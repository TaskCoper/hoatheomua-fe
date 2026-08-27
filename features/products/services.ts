import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { GetProductsParams } from './hooks/use-get-products'
import type { ProductDetail, ProductSellableQuantity, ProductSummary } from './types'

// The bulk stock endpoint is the one place the API shape is not pinned down: it
// may answer with a bare array, a paginated envelope, or a single row when one
// id is asked for. Normalizing here keeps every caller on `ProductSellableQuantity[]`.
type SellableQuantityValue = ProductSellableQuantity[] | { items: ProductSellableQuantity[] } | ProductSellableQuantity

const normalizeSellableQuantities = (value: SellableQuantityValue | null | undefined): ProductSellableQuantity[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if ('items' in value) return Array.isArray(value.items) ? value.items : []
  return value.id ? [value] : []
}

class ProductService {
  private readonly baseUrl = 'products'

  getProducts = async ({ pageIndex, pageSize, categoryIds, priceFrom, priceTo, search, sortBy }: GetProductsParams) => {
    const { data } = await api.get<BasePaginationResponse<ProductDetail>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        categoryIds,
        priceFrom,
        priceTo,
        search,
        sortBy
      }
    })

    return data
  }

  getProductsSellableQuantity = async ({ productIds }: { productIds: string[] }) => {
    const { data } = await api.post<BaseResponse<SellableQuantityValue>>(`/v1/${this.baseUrl}/filter`, { productIds })

    return normalizeSellableQuantities(data.value)
  }

  getProduct = async ({ id }: { id: string }) => {
    const { data } = await api.get<BaseResponse<ProductDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  getProductSummary = async ({ id }: { id: string }) => {
    const { data } = await api.get<BaseResponse<ProductSummary>>(`/v2/${this.baseUrl}/${id}/detail`)

    return data.value
  }

  getMaxPriceProduct = async ({ categoryIds }: { categoryIds?: string[] }) => {
    const { data } = await api.get<BaseResponse<number>>(`/v1/${this.baseUrl}/max-price`, {
      params: {
        categoryIds
      }
    })

    return data.value
  }
}

const productService = new ProductService()
export default productService
