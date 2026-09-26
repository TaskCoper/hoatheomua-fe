import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PRODUCTS_PAGE_SIZE } from '../constants'
import productService from '../services'
import type { GetProductsParams } from './use-get-products'

interface InfiniteProductsParams extends Omit<GetProductsParams, 'pageIndex'> {
  enabled?: boolean
}

export const infiniteProductsQuery = ({
  pageSize = PRODUCTS_PAGE_SIZE,
  search,
  categoryIds,
  priceFrom,
  priceTo,
  // sortBy = ['-sellablequantity'],
  sortBy,
  labels,
  enabled = true
}: InfiniteProductsParams) =>
  infiniteQueryOptions({
    queryKey: ['products', 'infinite', pageSize, search, categoryIds, priceFrom, priceTo, sortBy, labels] as const,
    queryFn: ({ pageParam }) =>
      productService.getProducts({
        pageIndex: pageParam,
        pageSize,
        search,
        categoryIds,
        priceFrom,
        priceTo,
        sortBy,
        labels
      }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.value.hasNextPage ? (lastPage.value.pageIndex || allPages.length) + 1 : undefined,
    enabled
  })

export const useGetInfiniteProducts = (params: InfiniteProductsParams) => {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    infiniteProductsQuery(params)
  )

  const products = useMemo(() => data?.pages.flatMap((page) => page.value.items) ?? [], [data])

  return {
    products,
    isGettingProducts: isPending,
    isGettingMoreProducts: isFetchingNextPage,
    hasMoreProducts: hasNextPage,
    loadMoreProducts: fetchNextPage
  }
}
