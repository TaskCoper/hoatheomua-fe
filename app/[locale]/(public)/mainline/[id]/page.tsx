import categoryService from '@/features/categories/services'
import { getMainlineCard } from '@/features/mainline/queries.server'
import OccasionDetailContent from '@/features/occasions/components/occasion-detail-content'
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
      images: card.image ? [{ url: card.image, alt: card.name[locale] }] : undefined
    }
  }
}

export default async function MainlinePage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { id } = await params
  const card = await getMainlineCard(id)

  if (!card) {
    notFound()
  }

  const sections = [
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
          badge={card.badge}
          sections={sections}
          promiseSection={<ProductsPromiseSection />}
        />
      </Suspense>
    </HydrationBoundary>
  )
}
