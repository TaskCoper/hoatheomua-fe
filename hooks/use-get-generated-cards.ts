import generatedCardService from '@/services/generated-card.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import type { GetGeneratedCardsByProductsPayload } from '@/types/generated-card.type'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const GENERATED_CARDS_QUERY_PREFIX = ['generated-cards'] as const

export const infiniteGeneratedCardsByProductsQuery = ({
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  productIds
}: Omit<GetGeneratedCardsByProductsPayload, 'pageIndex'>) =>
  infiniteQueryOptions({
    queryKey: [...GENERATED_CARDS_QUERY_PREFIX, 'by-products', 'infinite', { pageSize, search, productIds }] as const,
    queryFn: ({ pageParam }) =>
      generatedCardService.getGeneratedCardsByProducts({
        pageIndex: pageParam,
        pageSize,
        search,
        productIds
      }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? (lastPage.pageIndex || allPages.length) + 1 : undefined,
    // No product picked yet means there is nothing to ask the endpoint for.
    enabled: productIds.length > 0
  })

/** Every card the customer generated for the given products, a page at a time. */
export const useGetInfiniteGeneratedCardsByProducts = (
  params: Omit<GetGeneratedCardsByProductsPayload, 'pageIndex'>
) => {
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    infiniteGeneratedCardsByProductsQuery(params)
  )

  const generatedCardItems = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])
  const totalCount = data?.pages[0]?.totalCount ?? generatedCardItems.length

  return {
    generatedCardItems,
    totalCount,
    isGettingGeneratedCards: isLoading,
    isGeneratedCardsError: isError,
    isGettingMoreGeneratedCards: isFetchingNextPage,
    hasMoreGeneratedCards: hasNextPage,
    loadMoreGeneratedCards: fetchNextPage
  }
}
