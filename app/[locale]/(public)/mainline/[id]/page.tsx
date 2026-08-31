import { getCachedCategories } from '@/features/categories/queries.server'
import type { SortableCategory } from '@/features/categories/types'
import { getAllMainlineIds, getMainlineCard } from '@/features/mainline/queries.server'
import OccasionDetailContent from '@/features/occasions/components/occasion-detail-content'
import { prefetchDetailSections } from '@/features/occasions/section-prefetch.server'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { decodeImageViewport } from '@/lib/image-viewport'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

// Filters are read from the URL in the browser (nuqs), not on the server, so the
// page stays ISR: we prerender the HTML once and serve it from cache, rebuilding at
// most this often (the revalidate webhook purges it on demand for real changes).
export const revalidate = 300
export const dynamicParams = true

// Prebuild the enabled mainline cards at build time so the first visit to a hot
// detail page is served from cache instead of paying the full render waterfall.
// The long tail is still generated on demand (`dynamicParams = true`).
export async function generateStaticParams() {
  const ids = await getAllMainlineIds()
  return routing.locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const card = await getMainlineCard(id)

  if (!card) {
    return {
      title: locale === 'en' ? 'Product line not found' : 'Không tìm thấy dòng sản phẩm',
      robots: { index: false, follow: true }
    }
  }

  const seoName = card.name[locale]
  const description = card.description[locale]

  return {
    title: `${seoName} - Hoa Theo Mùa`,
    description,
    openGraph: {
      title: `${seoName} - Hoa Theo Mùa`,
      description,
      images: card.image ? [{ url: decodeImageViewport(card.image).src, alt: card.name[locale] }] : undefined
    }
  }
}

export default async function MainlinePage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { id } = await params

  const queryClient = getQueryClient()

  // The card and the (cached) category tree are independent, so fetch them in
  // parallel. Categories seed the client `useGetCategories` cache and resolve the
  // sections' category ids for the products prefetch below.
  const [card, categories] = await Promise.all([
    getMainlineCard(id),
    getCachedCategories().catch((error): SortableCategory[] => {
      console.error('[SSR] categories prefetch failed:', error)
      return []
    })
  ])

  if (!card) {
    notFound()
  }

  queryClient.setQueryData(['categories', undefined], categories)

  const sections = [
    {
      key: 'default',
      categoryIds: card.categoryIds,
      skuPrefix: null,
      campaign: null
    }
  ]

  await prefetchDetailSections(queryClient, categories, sections)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={null}>
        <OccasionDetailContent
          card={card}
          badge={card.badge}
          sections={sections}
          promiseSection={<ProductsPromiseSection />}
        />
      </Suspense>
    </HydrationBoundary>
  )
}
