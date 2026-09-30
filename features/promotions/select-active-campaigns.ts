import { ALLOWED_IMAGE_HOSTS, BUSINESS_TIMEZONE, MAX_VISIBLE_CAMPAIGNS } from '@/features/promotions/constants'
import { isAuthModalPath, matchesPages } from '@/features/promotions/match-page'
import type { PromotionPopupCollection, PromotionPopupItem } from '@/types/config.type'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Stable reference so a fresh `[]` doesn't make the downstream `useMemo` recompute for nothing.
const EMPTY: readonly PromotionPopupItem[] = []

/**
 * "Today" in the business timezone, not the visitor's. `now` is injected (never
 * call this inside `selectActiveCampaigns`) so the selector stays pure.
 */
export const businessToday = (now: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: BUSINESS_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now)

    const at = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
    const value = `${at('year')}-${at('month')}-${at('day')}`

    if (ISO_DATE.test(value)) return value
  } catch {
    // Fall through to the fixed-offset path below.
  }

  // Vietnam has no DST, so a fixed UTC+7 shift is correct; '' would silently kill every campaign.
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

const isRenderableImage = (image: unknown): boolean => {
  if (typeof image !== 'string' || !image.startsWith('https://')) return false

  try {
    return ALLOWED_IMAGE_HOSTS.includes(new URL(image).hostname.toLowerCase())
  } catch {
    return false
  }
}

/**
 * Pure selector: given the parsed collection, business date, and locale-less
 * path, returns the campaigns to show, capped at `max`. `endDate` is inclusive.
 * Route scope is applied here so an empty result is the only signal callers need.
 */
export const selectActiveCampaigns = (
  collection: PromotionPopupCollection | null,
  today: string,
  path: string,
  max: number = MAX_VISIBLE_CAMPAIGNS
): readonly PromotionPopupItem[] => {
  if (isAuthModalPath(path)) return EMPTY

  // Fails closed: a missing or garbage section shows nothing rather than showing anyway.
  if (!collection || collection.section?.enabled !== true) return EMPTY
  if (!Array.isArray(collection.items)) return EMPTY

  const active = collection.items.filter((item) => {
    if (!item || item.enabled !== true) return false

    if (!isRenderableImage(item.image)) return false

    const start = typeof item.startDate === 'string' ? item.startDate.trim() : ''
    const end = typeof item.endDate === 'string' ? item.endDate.trim() : ''

    // A malformed date ("31/08/2026") is rejected rather than guessed at.
    if (start !== '' && !ISO_DATE.test(start)) return false
    if (end !== '' && !ISO_DATE.test(end)) return false

    if (start !== '' && start > today) return false
    // Only `<` rejects, so `end === today` passes - the inclusive end date.
    if (end !== '' && end < today) return false

    // Empty item pages inherit the section's, already defaulted upstream.
    const pages = Array.isArray(item.pages) && item.pages.length > 0 ? item.pages : collection.section.pages

    return matchesPages(pages ?? [], path)
  })

  return active.length === 0 ? EMPTY : active.slice(0, max)
}

/** Order-independent identity of the active set, so a newly published campaign re-triggers the popup. */
export const campaignSignature = (campaigns: readonly PromotionPopupItem[]): string =>
  campaigns
    .map((campaign) => campaign.id)
    .sort()
    .join('|')
