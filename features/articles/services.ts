import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import { Article } from './types'

class ArticleService {
  private readonly baseUrl = 'news'

  getArticles = async ({ pageSize, pageIndex }: GetArticlesParams) => {
    const { data } = await api.get<BasePaginationResponse<Article>>(`/v1/${this.baseUrl}`, {
      params: { pageIndex, pageSize, status: 1 }
    })

    return data
  }

  getArticle = async ({ identifier }: GetArticleParams) => {
    const { data } = await api.get<BaseResponse<Article>>(`/v1/${this.baseUrl}/${identifier}`)

    return data.value
  }
}

const articleService = new ArticleService()
export default articleService
