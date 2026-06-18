import api, { BaseResponse } from '@/lib/axios'
import { GetProductsParams } from './hooks/use-get-products'
import { Product, ProductDetail } from './types'

class ProductService {
  private readonly baseUrl = 'v1/products'

  getProducts = async ({ ids, status, size, sort, next }: GetProductsParams) => {
    const { data } = await api.post<
      BaseResponse<{
        code: number
        data: Product[]
        paginator: {
          next: {
            id: number
          }
        }
      }>
    >(`${this.baseUrl}/nhanh-vn/list`, {
      filters: {
        ids,
        status
      },
      paginator: {
        size,
        sort,
        next
      }
    })

    return data
  }

  getProduct = async ({ id }: { id?: string }) => {
    const { data } = await api.post<
      BaseResponse<{
        code: number
        data: ProductDetail
      }>
    >(`${this.baseUrl}/nhanh-vn/details`, {
      filters: {
        id
      }
    })

    return data.value.data
  }
}

const productService = new ProductService()
export default productService
