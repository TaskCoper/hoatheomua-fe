import { keepPreviousData, useQuery } from '@tanstack/react-query'
import productService from '../services'

export interface GetProductsParams {
  ids?: number[]
  status?: number[]
  size?: number
  sort?: Record<string, 'asc' | 'desc'>
  next?: Record<string, number>
}

export const buildGetProductsKey = ({
  ids = [],
  status = [],
  size = 12,
  sort = { id: 'desc' },
  next = { id: 0 }
}: GetProductsParams = {}) => ['products', { ids, status, size, sort, next }] as const

export const useGetProducts = ({
  ids = [],
  status = [],
  size = 12,
  sort = {
    id: 'desc'
  },
  next = {
    id: 0
  }
}: GetProductsParams = {}) => {
  const {
    data: products,
    isFetching: isFetchingProducts,
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: buildGetProductsKey({ ids, status, size, sort, next }),
    queryFn: () => productService.getProducts({ ids, status, size, sort, next }),
    placeholderData: keepPreviousData
  })

  return { products, isFetchingProducts, isLoadingProducts }
}
