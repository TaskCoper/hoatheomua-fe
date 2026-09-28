import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PRODUCTS_PAGE_SIZE } from '../constants'
import productService from '../services'
import type { GetProductsParams } from './use-get-products'

interface InfiniteProductsParams extends Omit<GetProductsParams, 'pageIndex'> {
  enabled?: boolean
  /**
   * Cap on how many pages stay resident. Left undefined every fetched page is kept -
   * which is what the studio option lists want. Set it (the home carousel does) to turn
   * the cache into a sliding window: fetching forward drops the oldest page, fetching
   * backward drops the newest, so memory stays at `maxPages * pageSize` items no matter
   * how deep the catalog is. React Query only trims when it can walk backwards again,
   * hence `getPreviousPageParam` below.
   */
  maxPages?: number
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
  enabled = true,
  maxPages
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
    getNextPageParam: (lastPage, allPages, lastPageParam) =>
      lastPage.value.hasNextPage ? (lastPage.value.pageIndex || lastPageParam || allPages.length) + 1 : undefined,
    getPreviousPageParam: (firstPage, _allPages, firstPageParam) => {
      const current = firstPage.value.pageIndex || firstPageParam
      return firstPage.value.hasPreviousPage && current > DEFAULT_PAGE_INDEX ? current - 1 : undefined
    },
    maxPages,
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
