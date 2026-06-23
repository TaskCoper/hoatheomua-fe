import { useInfiniteQuery } from '@tanstack/react-query'
import newService from '../services'

export const NEWS_INFINITE_DEFAULT_PAGE_SIZE = 10

export const buildNewsInfiniteKey = ({ pageSize = NEWS_INFINITE_DEFAULT_PAGE_SIZE } = {}) =>
  ['news', 'infinite', { pageSize }] as const

export const useGetNewsInfinite = ({ pageSize = NEWS_INFINITE_DEFAULT_PAGE_SIZE } = {}) =>
  useInfiniteQuery({
    queryKey: buildNewsInfiniteKey({ pageSize }),
    queryFn: ({ pageParam }) => newService.getNewsPageMapped(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageIndex + 1 : undefined)
  })
