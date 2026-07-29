import categoryService from '@/features/categories/services'
import { resolveCard } from '@/features/occasions/campaign'
import OccasionDetailContent from '@/features/occasions/components/occasion-detail-content'
import { getOccasionCard } from '@/features/occasions/queries.server'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

// The detail sections now carry URL-driven category filters (nuqs) → render on
// the server per request instead of ISR.
export const dynamic = 'force-dynamic'

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

  try {
    await queryClient.prefetchQuery({
      queryKey: ['categories', undefined],
      queryFn: () => categoryService.getCategories()
    })
  } catch (error) {
    console.error('[SSR] categories prefetch failed:', error)
  }

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
