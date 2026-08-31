import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { GetProductsParams } from './hooks/use-get-products'
import type { CoreMaterialShortage, ProductDetail, ProductSellableQuantity, ProductSummary } from './types'

export interface CoreProductCheckItem {
  productId: string
  quantity: number
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
    const { data } = await api.post<BaseResponse<ProductSellableQuantity[]>>(`/v1/${this.baseUrl}/filter`, {
      productIds
    })

    return data.value
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

  checkCoreProducts = async ({ items }: { items: CoreProductCheckItem[] }) => {
    const { data } = await api.post<BaseResponse<CoreMaterialShortage[]>>(`/v1/${this.baseUrl}/check-core`, {
      items
    })

    // A fulfillable order has nothing to report, which the API may send as null.
    return data.value ?? []
  }
}

const productService = new ProductService()
export default productService
