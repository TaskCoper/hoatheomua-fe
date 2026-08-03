import NewsContent from '@/features/articles/components/news-content'
import NewsDefault from '@/features/articles/components/news-default'
import { getArticlesQuery } from '@/features/articles/queries'
import { getCachedArticles } from '@/features/articles/queries.server'
import { buildNewsCollectionJsonLd, generateNewsListMetadata } from '@/features/articles/seo'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params

  return generateNewsListMetadata(locale)
}

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  const queryClient = getQueryClient()
  const options = getArticlesQuery({ pageSize: DEFAULT_PAGE_SIZE, pageIndex: DEFAULT_PAGE_INDEX, locale })

  let initialNews: Awaited<ReturnType<typeof getCachedArticles>>['value']['items'] = []

  try {
    const data = await getCachedArticles({ pageSize: DEFAULT_PAGE_SIZE, pageIndex: DEFAULT_PAGE_INDEX, locale })
    queryClient.setQueryData(options.queryKey, data)
    initialNews = data.value.items
  } catch (error) {
    console.error('[SSR] news list prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildNewsCollectionJsonLd(locale, initialNews)} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NewsDefault locale={locale} />}>
          <NewsContent locale={locale} />
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
