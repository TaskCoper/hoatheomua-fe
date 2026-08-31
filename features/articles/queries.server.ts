import 'server-only'

import { CONTENT_LIFE } from '@/lib/cache-life'
import { isAxiosError } from 'axios'
import { cacheLife, cacheTag } from 'next/cache'
import { cache } from 'react'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import articleService from './services'
import type { Article } from './types'

export const ARTICLES_CACHE_TAG = 'articles'

const SLUG_CRAWL_PAGE_SIZE = 50

type ArticlesListParams = GetArticlesParams & { locale: string }

// Server-side hydration only ever prefetches page 1, so the route can stay ISR;
// any other page is fetched live by the client
export async function getCachedArticles(params: ArticlesListParams) {
  'use cache'
  cacheTag(ARTICLES_CACHE_TAG)
  cacheLife(CONTENT_LIFE)

  return articleService.getArticles(params)
}

async function getArticleCached(identifier: string): Promise<Article | null> {
  'use cache'
  cacheTag(ARTICLES_CACHE_TAG)
  cacheLife(CONTENT_LIFE)

  try {
    return await articleService.getArticle({ identifier })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

const cachedGetArticle = cache(getArticleCached)

export const getArticle = ({ identifier }: GetArticleParams) => cachedGetArticle(identifier)

export async function getAllArticleSlugs(): Promise<string[]> {
  'use cache'
  cacheTag(ARTICLES_CACHE_TAG)
  cacheLife(CONTENT_LIFE)

  const slugs: string[] = []
  let pageIndex = 1

  try {
    while (true) {
      const page = await articleService.getArticles({
        pageIndex,
        pageSize: SLUG_CRAWL_PAGE_SIZE
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
