import api, { BasePaginationResponse } from '@/lib/axios'
import { mapNewsItem, type NewsApiItem, type NewsPageResult } from '@/lib/news-shared'
import { GetNewsParams } from './hooks/use-get-news'
import { NewRow } from './types'

interface NewsPaginationValue {
  items: NewsApiItem[]
  pageIndex: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface NewsPaginationResponse {
  value: NewsPaginationValue
  isSuccess: boolean
  isFailed: boolean
  error: unknown
  traceId: string
  timestampUtc: string
}

class NewService {
  private readonly baseUrl = 'v1/news'

  getNews = async ({ pageIndex, pageSize, keyword, status }: GetNewsParams) => {
    const { data } = await api.get<BasePaginationResponse<NewRow>>(`${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        keyword,
        status
      }
    })

    return data
  }

  getNewsPageMapped = async (pageIndex: number, pageSize: number): Promise<NewsPageResult> => {
    const { data } = await api.get<NewsPaginationResponse>(`${this.baseUrl}`, {
      params: { pageIndex, pageSize }
    })

    return {
      items: data.value.items.map(mapNewsItem),
      pageIndex: data.value.pageIndex,
      hasNextPage: data.value.hasNextPage,
      totalCount: data.value.totalCount
    }
  }
}

const newService = new NewService()
export default newService
