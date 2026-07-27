import { queryOptions } from '@tanstack/react-query'
import type { GetProductsParams } from './hooks/use-get-products'
import productService from './services'

export const productListQuery = (params: GetProductsParams) =>
  queryOptions({
    queryKey: ['products', { params }] as const,
    queryFn: () => productService.getProducts(params)
  })

export const fetchProductDetail = (id: string) => productService.getProduct({ id })

export const productDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['product', id] as const,
    queryFn: () => fetchProductDetail(id)
  })
