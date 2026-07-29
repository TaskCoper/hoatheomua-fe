import categoryService from '@/features/categories/services'
import { CategoryProductPage } from '@/features/categories/types'
import HomeContent from '@/features/home/components/home-content'
import { buildHomeJsonLd, generateHomeMetadata } from '@/features/home/seo'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

// URL-driven filters (nuqs) in the home category sections make this route request-specific → render on the server per request.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  return generateHomeMetadata(locale)
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  setRequestLocale(locale)

  const queryClient = getQueryClient()
  const categoryPage = [CategoryProductPage.Home]

  try {
    await queryClient.prefetchQuery({
      queryKey: ['categories', categoryPage],
      queryFn: () => categoryService.getCategories({ page: categoryPage })
    })
  } catch (error) {
    console.error('[SSR] home categories prefetch failed:', error)
  }

  const homeJsonLd = await buildHomeJsonLd()

  return (
    <>
      <JsonLd data={homeJsonLd} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <HomeContent />
        </Suspense>
      </HydrationBoundary>
    </>
  )
}
