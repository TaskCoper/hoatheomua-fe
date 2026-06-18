import api, { BasePaginationResponse } from '@/lib/axios'
import { GetNewsParams } from './hooks/use-get-news'
import { NewRow } from './types'

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
}

const newService = new NewService()
export default newService
