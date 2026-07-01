import type { LocalizedText, OccasionCampaign, OccasionCard } from '@/types/config.type'

export const todayYMD = (): string => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const hasText = (text: LocalizedText | undefined): boolean => Boolean(text && (text.vi || text.en))

const isCampaignActive = (c: OccasionCampaign, ymd: string): boolean =>
  c.enabled && Boolean(c.startDate) && Boolean(c.endDate) && c.startDate <= ymd && ymd <= c.endDate

export const getActiveCampaigns = (card: OccasionCard, ymd = todayYMD()): OccasionCampaign[] =>
  card.campaigns?.filter((c) => isCampaignActive(c, ymd)) ?? []

export const getActiveCampaign = (card: OccasionCard, ymd = todayYMD()): OccasionCampaign | null =>
  getActiveCampaigns(card, ymd)[0] ?? null

export interface ResolvedOccasionCard {
  id: string
  image: string
  name: LocalizedText
  description: LocalizedText
  badge: LocalizedText
  categoryIds: string[]
  seoTitle: LocalizedText
  skuPrefix: string | null
  activeCampaigns: OccasionCampaign[]
}

export const resolveCard = (card: OccasionCard, ymd = todayYMD()): ResolvedOccasionCard => {
  const activeCampaigns = getActiveCampaigns(card, ymd)
  const primary = activeCampaigns[0] ?? null

  const badge = primary && hasText(primary.badge) ? primary.badge : card.badge
  const categoryIds = primary && primary.categoryIds.length > 0 ? primary.categoryIds : card.categoryIds

  return {
    id: card.id,
    image: card.image,
    name: card.name,
    description: card.description,
    badge,
    categoryIds,
    seoTitle: primary?.campaignName ?? card.name,
    skuPrefix: primary?.skuPrefix ? primary.skuPrefix : null,
    activeCampaigns
  }
}
