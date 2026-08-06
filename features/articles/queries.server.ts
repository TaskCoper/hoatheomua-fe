import 'server-only'

import { isAxiosError } from 'axios'
import { cacheLife, cacheTag } from 'next/cache'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import articleService from './services'
import type { Article } from './types'

export const ARTICLES_CACHE_TAG = 'articles'

export const articleCacheTag = (slug: string) => `article:${slug}`

const SLUG_CRAWL_PAGE_SIZE = 50

type ArticlesListParams = GetArticlesParams & { locale: string }

// used on first page for faster data
export async function getCachedArticles(params: ArticlesListParams) {
  'use cache'
  cacheLife('hours')
  cacheTag(ARTICLES_CACHE_TAG)

  return articleService.getArticles(params)
}

// user for other pages for live SSR
export const getArticles = (params: ArticlesListParams) => articleService.getArticles(params)

export async function getArticle({
  identifier,
  locale
}: GetArticleParams & { locale: string }): Promise<Article | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(ARTICLES_CACHE_TAG, articleCacheTag(identifier))

  try {
    return await articleService.getArticle({ identifier, locale })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function getAllArticleSlugs(): Promise<string[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(ARTICLES_CACHE_TAG)

  const slugs: string[] = []
  let pageIndex = 1

  try {
    while (true) {
      const page = await articleService.getArticles({
        pageIndex,
        pageSize: SLUG_CRAWL_PAGE_SIZE,
        locale: 'vi'
      })

      for (const item of page.value.items) {
        slugs.push(item.slug)
      }

      if (!page.value.hasNextPage) break
      pageIndex += 1
    }
  } catch (error) {
    console.error('[SSR] article slugs enumeration failed:', error)
    return slugs
  }

  return slugs
}
