import type { CardPriceTier, CardSize } from '@/types/config.type'
import type { CardWritingMethod } from './types'

export const CARD_CONFIG_GROUP = 'card_config'
export const CARD_SIZES_KEY = 'card_config.sizes'
export const CARD_PRICES_KEY = 'card_config.prices'

/** The card sizes and the handwriting price ladder, both edited in the CMS. */
export interface CardConfig {
  sizes: CardSize[]
  priceTiers: CardPriceTier[]
}

export const hasCardConfig = (config: CardConfig): boolean => config.sizes.length > 0 && config.priceTiers.length > 0

const asNumber = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const parseJson = (raw: unknown): unknown => {
  if (typeof raw !== 'string') return raw

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Both configs are stored as `{ items: [...] }` JSON strings; anything else is not trusted. */
const readItems = (raw: unknown): unknown[] | null => {
  const source = parseJson(raw)
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null

  const items = (source as { items?: unknown }).items
  return Array.isArray(items) ? items : null
}

export const parseCardSizes = (raw: unknown): CardSize[] | null => {
  const items = readItems(raw)
  if (!items) return null

  const sizes = items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name.trim() : '',
      width: asNumber(item.width),
      height: asNumber(item.height),
      base_price: asNumber(item.base_price),
      max_words: asNumber(item.max_words)
    }))
    // The name is the id the order payload carries, so a nameless size cannot be ordered.
    .filter((size) => size.name.length > 0)

  return sizes.length > 0 ? sizes : null
}

export const parseCardPriceTiers = (raw: unknown): CardPriceTier[] | null => {
  const items = readItems(raw)
  if (!items) return null

  const tiers = items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      min_words: asNumber(item.min_words),
      max_words: asNumber(item.max_words),
      extra_price: asNumber(item.extra_price)
    }))
    .sort((a, b) => a.min_words - b.min_words)

  return tiers.length > 0 ? tiers : null
}

/** Words, not characters - the price ladder and every size budget are counted in words. */
export const countWords = (message: string): number => {
  const trimmed = message.trim()
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}

export const findCardSize = (config: CardConfig, sizeName: string): CardSize | null =>
  config.sizes.find((size) => size.name === sizeName) ?? null

export const getDefaultCardSizeName = (config: CardConfig): string => config.sizes[0]?.name ?? ''

/** The roomiest size the CMS lists - what a card ordered without a size of its own is held to. */
export const getLargestCardMaxWords = (config: CardConfig): number =>
  config.sizes.reduce((max, size) => Math.max(max, size.max_words), 0)

/** What the card can physically fit. A size the CMS no longer lists falls back to the roomiest. */
export const getCardMaxWords = (config: CardConfig, sizeName: string): number =>
  findCardSize(config, sizeName)?.max_words ?? getLargestCardMaxWords(config)

export const getCardSizePrice = (config: CardConfig, sizeName: string): number =>
  findCardSize(config, sizeName)?.base_price ?? 0

/** Words past the last tier stay on its price; `max_words` is what caps a message, not the ladder. */
export const getCardHandwritingPrice = (config: CardConfig, wordCount: number): number => {
  if (wordCount <= 0) return 0

  const tier =
    config.priceTiers.find((candidate) => wordCount >= candidate.min_words && wordCount <= candidate.max_words) ??
    config.priceTiers.at(-1)

  return tier?.extra_price ?? 0
}

export const getCardWritingSurcharge = ({
  config,
  wordCount,
  writingMethod
}: {
  config: CardConfig
  wordCount: number
  writingMethod: CardWritingMethod
}): number => (writingMethod === 'handwritten' ? getCardHandwritingPrice(config, wordCount) : 0)

export const getCardUnitPrice = ({
  config,
  sizeName,
  wordCount,
  writingMethod
}: {
  config: CardConfig
  sizeName: string
  wordCount: number
  writingMethod: CardWritingMethod
}): number => getCardSizePrice(config, sizeName) + getCardWritingSurcharge({ config, wordCount, writingMethod })
