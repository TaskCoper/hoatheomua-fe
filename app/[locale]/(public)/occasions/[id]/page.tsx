import categoryService from '@/features/categories/services'
import type { SortableCategory } from '@/features/categories/types'
import { resolveCard } from '@/features/occasions/campaign'
import OccasionDetailContent from '@/features/occasions/components/occasion-detail-content'
import { getOccasionCard } from '@/features/occasions/queries.server'
import { prefetchDetailSections } from '@/features/occasions/section-prefetch.server'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

// Filters are read from the URL in the browser (nuqs), not on the server, so the
// page stays ISR: we prerender the HTML once and serve it from cache, rebuilding at
// most this often (the revalidate webhook purges it on demand for real changes).
export const revalidate = 300

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const card = await getOccasionCard(id)

  if (!card) {
    return {
      title: locale === 'en' ? 'Occasion not found' : 'Không tìm thấy dịp',
      robots: { index: false, follow: true }
    }
  }

  const resolved = resolveCard(card)
  const seoName = resolved.seoTitle[locale] || resolved.seoTitle.vi || card.name[locale]
  const description = card.description[locale]

  return {
    title: `${seoName} — Hoa Theo Mùa`,
    description,
    openGraph: {
      title: `${seoName} — Hoa Theo Mùa`,
      description,
      images: card.image ? [{ url: card.image, alt: card.name[locale] }] : undefined
    }
  }
}

export default async function OccasionPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { id } = await params
  const card = await getOccasionCard(id)

  if (!card) {
    notFound()
  }

  const resolved = resolveCard(card)

  const sections =
    resolved.activeCampaigns.length > 0
      ? resolved.activeCampaigns.map((c) => ({
          key: c.id,
          categoryIds: c.categoryIds.length > 0 ? c.categoryIds : card.categoryIds,
          skuPrefix: c.skuPrefix || null,
          campaign: { name: c.campaignName, startDate: c.startDate, endDate: c.endDate }
        }))
      : [
          {
            key: 'default',
            categoryIds: card.categoryIds,
            skuPrefix: null,
            campaign: null
          }
        ]

  const queryClient = getQueryClient()

  // Fetch categories directly so we can both seed the client `useGetCategories`
  // cache and resolve the sections' category ids for the products prefetch below.
  let categories: SortableCategory[] = []

  try {
    categories = await categoryService.getCategories()
    queryClient.setQueryData(['categories', undefined], categories)
  } catch (error) {
    console.error('[SSR] categories prefetch failed:', error)
  }

  await prefetchDetailSections(queryClient, categories, sections)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={null}>
        <OccasionDetailContent
          card={card}
          badge={resolved.badge}
          sections={sections}
          promiseSection={<ProductsPromiseSection />}
        />
      </Suspense>
    </HydrationBoundary>
  )
}
