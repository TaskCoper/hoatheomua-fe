import 'server-only'

import { isAxiosError } from 'axios'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { GetArticleParams } from './hooks/use-get-article'
import { GetArticlesParams } from './hooks/use-get-articles'
import articleService from './services'
import type { Article } from './types'

export const ARTICLES_CACHE_TAG = 'articles'

const SLUG_CRAWL_PAGE_SIZE = 50
const REVALIDATE_SECONDS = 3600

type ArticlesListParams = GetArticlesParams & { locale: string }

// Server-side hydration only ever prefetches page 1, so the route can stay ISR;
// any other page is fetched live by the client
export const getCachedArticles = (params: ArticlesListParams) =>
  unstable_cache(() => articleService.getArticles(params), ['articles-list', JSON.stringify(params)], {
    tags: [ARTICLES_CACHE_TAG],
    revalidate: REVALIDATE_SECONDS
  })()

const cachedGetArticle = cache(
  (identifier: string): Promise<Article | null> =>
    unstable_cache(
      async () => {
        try {
          return await articleService.getArticle({ identifier })
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) return null
          throw error
        }
      },
      ['article-detail', identifier],
      { tags: [ARTICLES_CACHE_TAG], revalidate: REVALIDATE_SECONDS }
    )()
)

export const getArticle = ({ identifier }: GetArticleParams) => cachedGetArticle(identifier)

export const getAllArticleSlugs = (): Promise<string[]> =>
  unstable_cache(
    async () => {
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
    },
    ['article-slugs'],
    { tags: [ARTICLES_CACHE_TAG], revalidate: REVALIDATE_SECONDS }
  )()
