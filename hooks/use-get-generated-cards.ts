import generatedCardService from '@/services/generated-card.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import type { GetGeneratedCardsByProductsPayload, GetGeneratedCardsParams } from '@/types/generated-card.type'
import { infiniteQueryOptions, queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const GENERATED_CARDS_QUERY_PREFIX = ['generated-cards'] as const

export const infiniteGeneratedCardsQuery = ({ pageSize = DEFAULT_PAGE_SIZE }: GetGeneratedCardsParams = {}) =>
  infiniteQueryOptions({
    queryKey: [...GENERATED_CARDS_QUERY_PREFIX, 'infinite', { pageSize }] as const,
    queryFn: ({ pageParam }) => generatedCardService.getGeneratedCards({ pageIndex: pageParam, pageSize }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? (lastPage.pageIndex || allPages.length) + 1 : undefined
  })

/** Every card the customer has ever generated, a page at a time. */
export const useGetInfiniteGeneratedCards = (params: GetGeneratedCardsParams = {}) => {
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    infiniteGeneratedCardsQuery(params)
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

export const generatedCardsByProductsQuery = ({ productIds }: GetGeneratedCardsByProductsPayload) =>
  queryOptions({
    queryKey: [...GENERATED_CARDS_QUERY_PREFIX, 'by-products', { productIds }] as const,
    queryFn: () => generatedCardService.getGeneratedCardsByProducts({ productIds }),
    // No product picked yet means there is nothing to ask the endpoint for.
    enabled: productIds.length > 0
  })

/** Every card the customer generated for the given products - the endpoint returns them all, no paging. */
export const useGetGeneratedCardsByProducts = (params: GetGeneratedCardsByProductsPayload) => {
  const { data, isLoading, isError } = useQuery(generatedCardsByProductsQuery(params))

  const generatedCardItems = useMemo(() => data?.flatMap((row) => row.generatedCards) ?? [], [data])

  return {
    generatedCardItems,
    isGettingGeneratedCards: isLoading,
    isGeneratedCardsError: isError
  }
}
