import { queryOptions } from '@tanstack/react-query'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import articleService from './services'

export const getArticlesQuery = ({ pageSize, pageIndex }: GetArticlesParams) =>
  queryOptions({
    queryKey: ['articles', { pageIndex, pageSize }] as const,
    queryFn: () => articleService.getArticles({ pageSize, pageIndex })
  })

export const getArticleQuery = ({ identifier }: GetArticleParams) =>
  queryOptions({
    queryKey: ['articles', 'detail', identifier] as const,
    queryFn: () => articleService.getArticle({ identifier })
  })
