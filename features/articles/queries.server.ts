import 'server-only'

import { isAxiosError } from 'axios'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import articleService from './services'
import type { Article } from './types'

export const ARTICLES_CACHE_TAG = 'articles'

export const articleCacheTag = (slug: string) => `article:${slug}`

const SLUG_CRAWL_PAGE_SIZE = 50
const REVALIDATE_SECONDS = 3600

type ArticlesListParams = GetArticlesParams & { locale: string }

// used on first page for faster data
export const getCachedArticles = (params: ArticlesListParams) =>
  unstable_cache(() => articleService.getArticles(params), ['articles-list', JSON.stringify(params)], {
    tags: [ARTICLES_CACHE_TAG],
    revalidate: REVALIDATE_SECONDS
  })()

// user for other pages for live SSR
export const getArticles = (params: ArticlesListParams) => articleService.getArticles(params)

const cachedGetArticle = cache(
  (identifier: string, locale: string): Promise<Article | null> =>
    unstable_cache(
      async () => {
        try {
          return await articleService.getArticle({ identifier, locale })
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) return null
          throw error
        }
      },
      ['article-detail', identifier, locale],
      { tags: [ARTICLES_CACHE_TAG, articleCacheTag(identifier)], revalidate: REVALIDATE_SECONDS }
    )()
)

export const getArticle = ({ identifier, locale }: GetArticleParams & { locale: string }) =>
  cachedGetArticle(identifier, locale)

export const getAllArticleSlugs = (): Promise<string[]> =>
  unstable_cache(
    async () => {
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
    },
    ['article-slugs'],
    { tags: [ARTICLES_CACHE_TAG], revalidate: REVALIDATE_SECONDS }
  )()
