import api, { BasePaginationResponse, BaseResponse, localeHeaders } from '@/lib/axios'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import { Article } from './types'

class ArticleService {
  private readonly baseUrl = 'news'

  getArticles = async ({ pageSize, pageIndex, locale }: GetArticlesParams & { locale: string }) => {
    const { data } = await api.get<BasePaginationResponse<Article>>(`/v1/${this.baseUrl}`, {
      params: { pageIndex, pageSize },
      headers: localeHeaders(locale)
    })

    return data
  }

  getArticle = async ({ identifier, locale }: GetArticleParams & { locale: string }) => {
    const { data } = await api.get<BaseResponse<Article>>(`/v1/${this.baseUrl}/${identifier}`, {
      headers: localeHeaders(locale)
    })

    return data.value
  }
}

const articleService = new ArticleService()
export default articleService
