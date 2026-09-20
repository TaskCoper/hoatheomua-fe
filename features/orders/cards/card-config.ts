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

/** Only reached when the CMS has no card config yet - a card must always be priceable. */
export const DEFAULT_CARD_SIZES: CardSize[] = [
  { name: 'S', width: 6, height: 9, base_price: 15_000, max_words: 20 },
  { name: 'M', width: 9, height: 13, base_price: 25_000, max_words: 40 },
  { name: 'L', width: 13, height: 18, base_price: 40_000, max_words: 70 }
]

export const DEFAULT_CARD_PRICE_TIERS: CardPriceTier[] = [
  { min_words: 1, max_words: 20, extra_price: 20_000 },
  { min_words: 21, max_words: 40, extra_price: 35_000 },
  { min_words: 41, max_words: 70, extra_price: 50_000 }
]

export const DEFAULT_CARD_CONFIG: CardConfig = {
  sizes: DEFAULT_CARD_SIZES,
  priceTiers: DEFAULT_CARD_PRICE_TIERS
}

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

/** A `null` size - the free card has none - is held to the most generous budget. */
export const getCardMaxWords = (config: CardConfig, sizeName: string | null): number => {
  if (sizeName !== null) {
    const size = findCardSize(config, sizeName)
    if (size) return size.max_words
  }

  return config.sizes.reduce((max, size) => Math.max(max, size.max_words), 0)
}

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
