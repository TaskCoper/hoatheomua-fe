import 'server-only'

import { CACHE_LIFE } from '@/lib/cache-life'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { isAxiosError } from 'axios'
import { cacheLife, cacheTag } from 'next/cache'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import { getArticlesQuery } from './queries'
import articleService from './services'

export const ARTICLES_CACHE_TAG = 'articles'

// Per-article tag so one news mutation can purge just that article's detail
// data — and, via tag propagation, its ISR page HTML — without waiting on the
// broad `articles` list tag or fragile per-locale path matching.
export const articleDetailTag = (slug: string) => `article:${slug}`

export async function getCachedArticles(params: GetArticlesParams & { locale: string }) {
  'use cache'
  cacheLife(CACHE_LIFE.list)
  cacheTag(ARTICLES_CACHE_TAG)

  return articleService.getArticles(params)
}

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

export async function getArticle({ identifier, locale }: GetArticleParams & { locale: string }) {
  'use cache'
  cacheLife(CACHE_LIFE.static1h)
  cacheTag(ARTICLES_CACHE_TAG)
  cacheTag(articleDetailTag(identifier))

  try {
    return await articleService.getArticle({ identifier, locale })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}
