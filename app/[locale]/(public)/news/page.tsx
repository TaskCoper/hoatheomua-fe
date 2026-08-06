import NewsContent from '@/features/articles/components/news-content'
import NewsDefault from '@/features/articles/components/news-default'
import { getArticlesQuery } from '@/features/articles/queries'
import { getArticles, getCachedArticles } from '@/features/articles/queries.server'
import { loadNewsSearch } from '@/features/articles/search-params'
import { buildNewsCollectionJsonLd, generateNewsListMetadata } from '@/features/articles/seo'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import type { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

type NewsPageProps = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params, searchParams }: NewsPageProps): Promise<Metadata> {
  const [{ locale }, { page }] = await Promise.all([params, loadNewsSearch(searchParams)])

  return generateNewsListMetadata(locale, page)
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <NewsList locale={locale} searchParams={searchParams} />
}

async function NewsList({ locale, searchParams }: { locale: Locale; searchParams: Promise<SearchParams> }) {
  const { page } = await loadNewsSearch(searchParams)
  const isFirstPage = page <= DEFAULT_PAGE_INDEX

  const queryClient = getQueryClient()
  const listParams = { pageSize: DEFAULT_PAGE_SIZE, pageIndex: page, locale }
  const options = getArticlesQuery(listParams)

  let initialNews: Awaited<ReturnType<typeof getCachedArticles>>['value']['items'] = []

  try {
    const data = isFirstPage ? await getCachedArticles(listParams) : await getArticles(listParams)

    queryClient.setQueryData(options.queryKey, data)
    initialNews = data.value.items
  } catch (error) {
    console.error('[SSR] news list prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildNewsCollectionJsonLd(locale, initialNews, page)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NewsDefault locale={locale} pageIndex={page} />}>
          <NewsContent locale={locale} />
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
