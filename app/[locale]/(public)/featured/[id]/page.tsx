import { getFeaturedCard } from '@/features/featured/queries.server'
import { resolveCard } from '@/features/occasions/campaign'
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
  const result = await getFeaturedCard(id)

  if (!result) {
    return {
      title: locale === 'en' ? 'Featured product not found' : 'Không tìm thấy sản phẩm nổi bật',
      robots: { index: false, follow: true }
    }
  }

  const { card, hasCampaigns } = result
  const resolved = hasCampaigns ? resolveCard(card) : null
  const seoName = resolved ? resolved.seoTitle[locale] || resolved.seoTitle.vi || card.name[locale] : card.name[locale]
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

export default async function FeaturedPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { id } = await params
  const result = await getFeaturedCard(id)

  if (!result) {
    notFound()
  }

  const { card, hasCampaigns } = result
  const toNumberIds = (ids: string[]) => ids.map((value) => Number(value)).filter((value) => Number.isFinite(value))

  if (hasCampaigns) {
    const resolved = resolveCard(card)
    const sections =
      resolved.activeCampaigns.length > 0
        ? resolved.activeCampaigns.map((c) => ({
            key: c.id,
            categoryIds: toNumberIds(c.categoryIds.length > 0 ? c.categoryIds : card.categoryIds),
            skuPrefix: c.skuPrefix || null,
            campaign: { name: c.campaignName, startDate: c.startDate, endDate: c.endDate }
          }))
        : [
            {
              key: 'default',
              categoryIds: toNumberIds(card.categoryIds),
              skuPrefix: null,
              campaign: null
            }
          ]

    return <OccasionDetailContent card={card} badge={resolved.badge} sections={sections} />
  }

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
