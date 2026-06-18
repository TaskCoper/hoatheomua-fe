import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import newService from '../services'
import { NewRow } from '../types'

export interface GetNewsParams {
  pageIndex?: number
  pageSize?: number
  keyword?: string
  status?: number
}

export const useGetNews = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  keyword,
  status
}: GetNewsParams = {}) => {
  const { data: news = getDefaultPaginationResponse<NewRow>(), isLoading: isGettingNews } = useQuery({
    queryKey: ['news', pageIndex, pageSize, keyword, status],
    queryFn: () => newService.getNews({ pageIndex, pageSize, keyword, status }),
    placeholderData: keepPreviousData
  })

  return { news, isGettingNews }
}
