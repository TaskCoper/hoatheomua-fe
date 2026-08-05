import 'server-only'

import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { isAxiosError } from 'axios'
import { cacheLife, cacheTag, unstable_cache } from 'next/cache'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import { getArticlesQuery } from './queries'
import articleService from './services'
import type { Article } from './types'

export const ARTICLES_CACHE_TAG = 'articles'

export const getCachedArticles = (params: GetArticlesParams & { locale: string }) =>
  unstable_cache(
    () => articleService.getArticles(params),
    ['articles-list', params.locale, String(params.pageIndex ?? ''), String(params.pageSize ?? '')],
    { tags: [ARTICLES_CACHE_TAG], revalidate: 60 }
  )()

export const getAllArticleSlugs = async () => {
  const slugs: string[] = []
  const qc = getQueryClient()
  let pageIndex = 1

  try {
    while (true) {
      const page = await qc.fetchQuery(getArticlesQuery({ pageSize: DEFAULT_PAGE_SIZE, pageIndex, locale: 'vi' }))

      for (const item of page.value.items) {
        slugs.push(item.slug)
      }

      if (!page.value.hasNextPage) break
      pageIndex += 1
    }
  } catch {
    return slugs
  }

  return slugs
}

export async function getArticle({
  identifier,
  locale
}: GetArticleParams & { locale: string }): Promise<Article | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(ARTICLES_CACHE_TAG)

  try {
    return await articleService.getArticle({ identifier, locale })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}
