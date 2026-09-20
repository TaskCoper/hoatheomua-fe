'use client'

import aiFlowerService from '@/features/studio/services'
import type { GetGeneratedFlowersParams } from '@/features/studio/types'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { queryOptions, useQuery } from '@tanstack/react-query'

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
