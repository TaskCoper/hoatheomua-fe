import { queryOptions } from '@tanstack/react-query'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import articleService from './services'

export const getArticlesQuery = ({ pageSize, pageIndex, locale }: GetArticlesParams & { locale: string }) =>
  queryOptions({
    queryKey: ['articles', { pageIndex, pageSize }, locale] as const,
    queryFn: () => articleService.getArticles({ pageSize, pageIndex, locale })
  })

export const getArticleQuery = ({ identifier, locale }: GetArticleParams & { locale: string }) =>
  queryOptions({
    queryKey: ['articles', 'detail', identifier, locale] as const,
    queryFn: () => articleService.getArticle({ identifier, locale })
  })
