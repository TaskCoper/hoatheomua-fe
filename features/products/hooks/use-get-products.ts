import { keepPreviousData, useQuery } from '@tanstack/react-query'
import productService from '../services'

export interface GetProductsParams {
  ids?: number[]
  status?: number[]
  categoryIds?: number[]
  name?: string
  price?: number[]
  size?: number
  sort?: Record<string, 'asc' | 'desc'>
  next?: Record<string, number>
}

export const buildGetProductsKey = ({
  ids = [],
  status = [],
  categoryIds = [],
  name = '',
  price,
  size = 50,
  sort = { id: 'desc' },
  next
}: GetProductsParams = {}) =>
  [
    'products',
    {
      ids,
      status,
      categoryIds,
      name,
      ...(price && price.length > 0 ? { price } : {}),
      size,
      sort,
      ...(next ? { next } : {})
    }
  ] as const

export const useGetProducts = ({
  ids = [],
  status = [],
  categoryIds = [],
  name = '',
  price,
  size = 50,
  sort = {
    id: 'desc'
  },
  next
}: GetProductsParams = {}) => {
  const {
    data: products,
    isFetching: isFetchingProducts,
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: buildGetProductsKey({ ids, status, categoryIds, name, price, size, sort, next }),
    queryFn: () => productService.getProducts({ ids, status, categoryIds, name, price, size, sort, next }),
    placeholderData: keepPreviousData
  })

  return { products, isFetchingProducts, isLoadingProducts }
}
