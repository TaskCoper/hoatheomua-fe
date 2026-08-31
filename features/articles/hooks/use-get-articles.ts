import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getArticlesQuery } from '../queries'
import { Article } from '../types'

export interface GetArticlesParams {
  pageIndex?: number
  pageSize?: number
}

export const useGetArticles = ({ pageIndex = DEFAULT_PAGE_INDEX, pageSize = DEFAULT_PAGE_SIZE }: GetArticlesParams) => {
  const {
    data: articles = getDefaultPaginationResponse<Article>(),
    isFetching: isFetchingArticles,
    isLoading: isLoadingArticles
  } = useQuery({
    ...getArticlesQuery({ pageSize, pageIndex }),
    placeholderData: keepPreviousData
  })

  return { articles, isFetchingArticles, isLoadingArticles }
}
