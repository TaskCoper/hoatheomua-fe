import NewsContent from '@/features/articles/components/news-content'
import { getArticlesQuery } from '@/features/articles/queries'
import { getCachedArticles } from '@/features/articles/queries.server'
import { NEWS_CURATED_PAGE_SIZE, NEWS_OTHER_STORIES_PAGE_SIZE } from '@/features/articles/search-params'
import { buildNewsCollectionJsonLd, generateNewsListMetadata } from '@/features/articles/seo'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

type NewsPageProps = {
  params: Promise<{ locale: Locale }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { locale } = await params

  return generateNewsListMetadata(locale)
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const queryClient = getQueryClient()

  const curatedParams = { pageIndex: DEFAULT_PAGE_INDEX, pageSize: NEWS_CURATED_PAGE_SIZE, locale }
  const otherParams = { pageIndex: DEFAULT_PAGE_INDEX, pageSize: NEWS_OTHER_STORIES_PAGE_SIZE, locale }

  let initialNews: Awaited<ReturnType<typeof getCachedArticles>>['value']['items'] = []

  try {
    const [curated, other] = await Promise.all([getCachedArticles(curatedParams), getCachedArticles(otherParams)])

    queryClient.setQueryData(getArticlesQuery(curatedParams).queryKey, curated)
    queryClient.setQueryData(getArticlesQuery(otherParams).queryKey, other)
    initialNews = other.value.items
  } catch (error) {
    console.error('[SSR] news list prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildNewsCollectionJsonLd(locale, initialNews)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NewsContent locale={locale} />
      </HydrationBoundary>
    </>
  )
}
