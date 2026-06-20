import api, { BaseResponse } from '@/lib/axios'
import { GetProductsParams } from './hooks/use-get-products'
import { Product, ProductDetail } from './types'

class ProductService {
  private readonly baseUrl = 'v1/products'

  getProducts = async ({
    ids = [],
    status = [],
    categoryIds = [],
    name = '',
    price,
    size = 50,
    sort = { id: 'asc' },
    next
  }: GetProductsParams) => {
    const trimmedName = name.trim()
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
        ...(ids.length > 0 ? { id: ids } : {}),
        ...(status.length > 0 ? { status } : {}),
        ...(categoryIds.length > 0 ? { categoryIds } : {}),
        ...(trimmedName.length > 0 ? { name: trimmedName } : {}),
        ...(price && price.length === 2 ? { price } : {})
      },
      paginator: {
        size,
        sort,
        ...(next ? { next } : {})
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
