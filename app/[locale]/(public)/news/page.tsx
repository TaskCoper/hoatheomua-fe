import { getArticlesQuery } from '@/features/articles/queries'
import { getCachedArticles } from '@/features/articles/queries.server'
import { buildNewsCollectionJsonLd, generateNewsListMetadata } from '@/features/articles/seo'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import type { SearchParams } from 'nuqs/server'
import NewsContent from '../../../../features/articles/components/news-content'
import { loadNewsSearch } from '../../../../features/articles/search-params'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params

  return generateNewsListMetadata(locale)
}

export default async function NewsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const { page } = await loadNewsSearch(searchParams)

  const queryClient = getQueryClient()
  const options = getArticlesQuery({ pageSize: DEFAULT_PAGE_SIZE, pageIndex: page, locale })

  let initialNews: Awaited<ReturnType<typeof getCachedArticles>>['value']['items'] = []

  try {
    const data = await getCachedArticles({ pageSize: DEFAULT_PAGE_SIZE, pageIndex: page, locale })
    queryClient.setQueryData(options.queryKey, data)
    initialNews = data.value.items
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
