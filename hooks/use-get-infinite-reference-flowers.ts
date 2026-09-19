import type { GetReferenceFlowersParams } from '@/hooks/use-get-reference-flowers'
import referenceFlowerSerivce from '@/services/reference-flower.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const infiniteReferenceFlowersQuery = ({
  pageSize = DEFAULT_PAGE_SIZE,
  type,
  search,
  isActive = true
}: Omit<GetReferenceFlowersParams, 'pageIndex'>) =>
  infiniteQueryOptions({
    queryKey: ['reference-flowers', 'infinite', pageSize, type, search, isActive] as const,
    queryFn: ({ pageParam }) =>
      referenceFlowerSerivce.getReferenceFlowers({ pageIndex: pageParam, pageSize, search, type, isActive }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? (lastPage.pageIndex || allPages.length) + 1 : undefined
  })

export const useGetInfiniteReferenceFlowers = (params: Omit<GetReferenceFlowersParams, 'pageIndex'>) => {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    infiniteReferenceFlowersQuery(params)
  )

  const referenceFlowers = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return {
    referenceFlowers,
    isGettingReferenceFlowers: isLoading,
    isGettingMoreReferenceFlowers: isFetchingNextPage,
    hasMoreReferenceFlowers: hasNextPage,
    loadMoreReferenceFlowers: fetchNextPage
  }
}
