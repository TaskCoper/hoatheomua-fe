import cardTemplateService from '@/services/card-template.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import type { CardTemplateType } from '@/types/card-template.type'
import { infiniteQueryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export interface GetCardTemplatesParams {
  pageIndex?: number
  pageSize?: number
  isActive?: boolean
  /** `'ai' | 'handmade'`. Omitted, the API returns every kind. */
  templateType?: CardTemplateType
  search?: string
  productIds?: string[]
}

export const CARD_TEMPLATES_QUERY_PREFIX = ['card-templates'] as const

export const useGetCardTemplates = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  isActive = true,
  templateType,
  search,
  productIds
}: GetCardTemplatesParams) => {
  const { data: cardTemplates, isLoading: isGettingCardTemplates } = useQuery({
    queryKey: [...CARD_TEMPLATES_QUERY_PREFIX, pageIndex, pageSize, isActive, templateType, search, productIds],
    queryFn: () =>
      cardTemplateService.getCardTemplates({
        pageIndex,
        pageSize,
        isActive,
        templateType,
        search,
        productIds
      })
  })

  return { cardTemplates, isGettingCardTemplates }
}

export const infiniteCardTemplatesQuery = ({
  pageSize = DEFAULT_PAGE_SIZE,
  isActive = true,
  templateType,
  search,
  productIds
}: Omit<GetCardTemplatesParams, 'pageIndex'> = {}) =>
  infiniteQueryOptions({
    queryKey: [
      ...CARD_TEMPLATES_QUERY_PREFIX,
      'infinite',
      { pageSize, isActive, templateType, search, productIds }
    ] as const,
    queryFn: ({ pageParam }) =>
      cardTemplateService.getCardTemplates({
        pageIndex: pageParam,
        pageSize,
        isActive,
        templateType,
        search,
        productIds
      }),
    initialPageParam: DEFAULT_PAGE_INDEX,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? (lastPage.pageIndex || allPages.length) + 1 : undefined
  })

export const useGetInfiniteCardTemplates = ({
  enabled = true,
  ...params
}: Omit<GetCardTemplatesParams, 'pageIndex'> & { enabled?: boolean } = {}) => {
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    ...infiniteCardTemplatesQuery(params),
    enabled
  })

  const cardTemplates = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])
  const totalCount = data?.pages[0]?.totalCount ?? cardTemplates.length

  return {
    cardTemplates,
    totalCount,
    isGettingCardTemplates: isLoading,
    isCardTemplatesError: isError,
    isGettingMoreCardTemplates: isFetchingNextPage,
    hasMoreCardTemplates: hasNextPage,
    loadMoreCardTemplates: fetchNextPage
  }
}
