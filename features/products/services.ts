import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { GetProductsParams } from './hooks/use-get-products'
import type { ProductDetail } from './types'

class ProductService {
  private readonly baseUrl = 'products'

  // ko filter theo isPin đc như trên swagger vì chỉ xài chung types với GET - v2/products chứ dưới code ko quan tâm
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

  getProduct = async ({ id }: { id: string }) => {
    const { data } = await api.get<BaseResponse<ProductDetail>>(`/v1/${this.baseUrl}/${id}`)

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
