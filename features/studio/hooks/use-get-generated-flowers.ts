'use client'

import aiFlowerService from '@/features/studio/services'
import { STUDIO_SESSIONS_PAGE_SIZE } from '@/features/studio/studio-data'
import type { GetGeneratedFlowersParams } from '@/features/studio/types'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { infiniteQueryOptions, queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const GENERATED_FLOWERS_QUERY_PREFIX = ['generated-flowers'] as const

export const generatedFlowersQuery = ({
  sessionId,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetGeneratedFlowersParams) =>
  queryOptions({
    queryKey: [...GENERATED_FLOWERS_QUERY_PREFIX, { sessionId, pageIndex, pageSize }] as const,
    queryFn: () => aiFlowerService.getGeneratedFlowers({ sessionId, pageIndex, pageSize }),
    enabled: Boolean(sessionId),
    staleTime: 0
  })

export const useGetGeneratedFlowers = (params: GetGeneratedFlowersParams) => {
  const { data, isPending, isError, isFetching, refetch } = useQuery(generatedFlowersQuery(params))

  return {
    sessions: data?.items ?? [],
    isGettingGeneratedFlowers: isPending,
    isGeneratedFlowersError: isError,
    isFetchingGeneratedFlowers: isFetching,
    refetchGeneratedFlowers: refetch
  }
}

export const infiniteGeneratedFlowersQuery = ({
  pageSize = STUDIO_SESSIONS_PAGE_SIZE
}: Omit<GetGeneratedFlowersParams, 'sessionId' | 'pageIndex'> = {}) =>
  infiniteQueryOptions({
    queryKey: [...GENERATED_FLOWERS_QUERY_PREFIX, 'infinite', { pageSize }] as const,
    queryFn: ({ pageParam }) => aiFlowerService.getGeneratedFlowers({ pageIndex: pageParam, pageSize }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? (lastPage.pageIndex || allPages.length) + 1 : undefined,
    staleTime: 0
  })

export const useGetInfiniteGeneratedFlowers = (
  params: Omit<GetGeneratedFlowersParams, 'sessionId' | 'pageIndex'> = {}
) => {
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    infiniteGeneratedFlowersQuery(params)
  )

  const sessions = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])
  const totalCount = data?.pages[0]?.totalCount ?? sessions.length

  return {
    sessions,
    totalCount,
    isGettingGeneratedFlowers: isLoading,
    isGeneratedFlowersError: isError,
    isGettingMoreGeneratedFlowers: isFetchingNextPage,
    hasMoreGeneratedFlowers: hasNextPage,
    loadMoreGeneratedFlowers: fetchNextPage
  }
}
