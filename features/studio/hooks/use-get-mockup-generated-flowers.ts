'use client'

import aiFlowerService from '@/features/studio/services'
import { STUDIO_MOCKUP_GALLERY_PAGE_SIZE } from '@/features/studio/studio-data'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const MOCKUP_GENERATED_FLOWERS_QUERY_PREFIX = ['mockup-generated-flowers'] as const

const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isMockupGalleryId = (mockupId: string | null | undefined): mockupId is string =>
  !!mockupId && GUID_PATTERN.test(mockupId)

interface MockupGeneratedFlowersArgs {
  mockupId: string | null | undefined
  pageSize?: number
  enabled?: boolean
}

export const infiniteMockupGeneratedFlowersQuery = ({
  mockupId,
  pageSize = STUDIO_MOCKUP_GALLERY_PAGE_SIZE,
  enabled = true
}: MockupGeneratedFlowersArgs) =>
  infiniteQueryOptions({
    queryKey: [...MOCKUP_GENERATED_FLOWERS_QUERY_PREFIX, 'infinite', { mockupId, pageSize }] as const,
    queryFn: ({ pageParam }) =>
      aiFlowerService.getMockupGeneratedFlowers({ mockupId: mockupId ?? '', pageIndex: pageParam, pageSize }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? (lastPage.pageIndex || allPages.length) + 1 : undefined,
    enabled: enabled && isMockupGalleryId(mockupId)
  })

export const useGetMockupGeneratedFlowers = (args: MockupGeneratedFlowersArgs) => {
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    infiniteMockupGeneratedFlowersQuery(args)
  )

  const flowers = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return {
    flowers,
    totalCount: data?.pages[0]?.totalCount ?? flowers.length,
    isGettingMockupFlowers: isLoading,
    isMockupFlowersError: isError,
    isGettingMoreMockupFlowers: isFetchingNextPage,
    hasMoreMockupFlowers: hasNextPage,
    loadMoreMockupFlowers: fetchNextPage
  }
}
