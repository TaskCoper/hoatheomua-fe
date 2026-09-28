import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PRODUCTS_PAGE_SIZE } from '../constants'
import productService from '../services'

export interface GetProductsParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  categoryIds?: string[]
  priceFrom?: number
  priceTo?: number
  sortBy?: string[]
  labels?: string[]
}

export const productsQueryKey = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = PRODUCTS_PAGE_SIZE,
  search,
  categoryIds,
  priceFrom,
  priceTo,
  sortBy,
  labels
}: GetProductsParams) =>
  ['products', pageIndex, pageSize, search, categoryIds, priceFrom, priceTo, sortBy, labels] as const

export const useGetProducts = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = PRODUCTS_PAGE_SIZE,
  search,
  categoryIds,
  priceFrom,
  priceTo,
  // sortBy = ['-sellablequantity'],
  sortBy,
  labels
}: GetProductsParams) => {
  const {
    data: products,
    isLoading: isGettingProducts,
    isFetching: isFetchingProducts
  } = useQuery({
    queryKey: productsQueryKey({ pageIndex, pageSize, search, categoryIds, priceFrom, priceTo, sortBy, labels }),
    queryFn: () =>
      productService.getProducts({ pageIndex, pageSize, search, categoryIds, priceFrom, priceTo, sortBy, labels }),
    placeholderData: keepPreviousData
  })

  return { products, isGettingProducts, isFetchingProducts }
}
