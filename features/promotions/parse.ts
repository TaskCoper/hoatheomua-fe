import { DEFAULT_POPUP_FREQUENCY, DEFAULT_POPUP_PAGES } from '@/features/promotions/constants'
import type { PromotionPopupCollection, PromotionPopupFrequency, PromotionPopupItem } from '@/types/config.type'

const FREQUENCIES: readonly PromotionPopupFrequency[] = ['once-per-session', 'every-load']

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

/** Unrecognised values fall back to `once-per-session`, never `every-load`. */
const normalizeFrequency = (value: unknown): PromotionPopupFrequency =>
  FREQUENCIES.includes(value as PromotionPopupFrequency) ? (value as PromotionPopupFrequency) : DEFAULT_POPUP_FREQUENCY

/** `fallback` is `[]` for items, which is the sentinel for "inherit the section". */
const normalizePages = (value: unknown, fallback: readonly string[]): string[] => {
  if (!Array.isArray(value)) return [...fallback]

  const patterns = value
    .map(asString)
    .map((pattern) => pattern.trim())
    .filter(Boolean)

  return patterns.length > 0 ? patterns : [...fallback]
}

const normalizeItem = (value: unknown, index: number): PromotionPopupItem | null => {
  if (!value || typeof value !== 'object') return null

  const item = value as Record<string, unknown>
  const alt = (item.alt && typeof item.alt === 'object' ? item.alt : {}) as Record<string, unknown>

  return {
    // Derived from the index, not random, so the id stays stable across renders.
    id: asString(item.id).trim() || `pp_fallback_${index}`,
    image: asString(item.image).trim(),
    href: asString(item.href).trim(),
    openInNewTab: item.openInNewTab === true,
    alt: { vi: asString(alt.vi), en: asString(alt.en) },
    startDate: asString(item.startDate).trim(),
    endDate: asString(item.endDate).trim(),
    enabled: item.enabled !== false,
    pages: normalizePages(item.pages, [])
  }
}

/** Accepts a JSON string or parsed object; returns `null` on any failure - the CMS blob is never trusted. */
export const parsePromotionPopup = (raw: unknown): PromotionPopupCollection | null => {
  let source: unknown = raw

  if (typeof raw === 'string') {
    try {
      source = JSON.parse(raw)
    } catch {
      return null
    }
  }

  if (!source || typeof source !== 'object' || Array.isArray(source)) return null

  const candidate = source as {
    section?: { enabled?: unknown; frequency?: unknown; pages?: unknown }
    items?: unknown
  }

  return {
    section: {
      enabled: candidate.section?.enabled === true,
      frequency: normalizeFrequency(candidate.section?.frequency),
      pages: normalizePages(candidate.section?.pages, DEFAULT_POPUP_PAGES)
    },
    items: Array.isArray(candidate.items)
      ? candidate.items.map(normalizeItem).filter((item): item is PromotionPopupItem => item !== null)
      : []
  }
}
