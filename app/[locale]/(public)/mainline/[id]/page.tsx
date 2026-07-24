import { getMainlineCard } from '@/features/mainline/queries.server'
import OccasionDetailContent from '@/features/occasions/components/occasion-detail-content'
import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 600
export const dynamicParams = true

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

  const toNumberIds = (ids: string[]) => ids.map((value) => Number(value)).filter((value) => Number.isFinite(value))

  const sections = [
    {
      key: 'default',
      categoryIds: toNumberIds(card.categoryIds),
      skuPrefix: null,
      campaign: null
    }
  ]

  return <OccasionDetailContent card={card} badge={card.badge} sections={sections} />
}
