import { queryOptions } from '@tanstack/react-query'
import type { ProductListParams } from './services'
import productService from './services'

export type { ProductListParams }

export const productListQuery = (params: ProductListParams, locale: string) =>
  queryOptions({
    queryKey: ['products', { params }, locale] as const,
    queryFn: () => productService.getProducts({ ...params, locale })
  })

export const fetchProductDetail = (id: string, locale: string) => productService.getProduct({ id, locale })

export const productDetailQuery = (id: string, locale: string) =>
  queryOptions({
    queryKey: ['product', id, locale] as const,
    queryFn: () => fetchProductDetail(id, locale)
  })
