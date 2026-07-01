import { resolveCard } from '@/features/occasions/campaign'
import { getOccasionCard } from '@/features/occasions/queries.server'
import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OccasionDetailContent from './_components/occasion-detail-content'

export const revalidate = 600
export const dynamicParams = true

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

  const toNumberIds = (ids: string[]) => ids.map((value) => Number(value)).filter((value) => Number.isFinite(value))

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
