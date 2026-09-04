export const VASE_CATEGORY_IDS = [19958, 58929, 58905, 58841, 58840]
export const DAILY_FLOWER_CATEGORY_IDS = [58869]

/** Product grid page size for the category-driven listing sections. */
export const PRODUCTS_PAGE_SIZE = 16

export const PRODUCT_CATEGORIES = [
  { id: 58896, labelKey: 'products.filter.categories.eventFlowers' },
  { id: 58869, labelKey: 'products.filter.categories.daily' },
  { id: 58901, labelKey: 'products.filter.categories.signature' },
  { id: 19958, labelKey: 'products.filter.categories.flowerVases' },
  { id: 58929, labelKey: 'products.filter.categories.saleOffVases' },
  { id: 58905, labelKey: 'products.filter.categories.bauTrucVases' },
  { id: 58841, labelKey: 'products.filter.categories.glassVases' },
  { id: 58840, labelKey: 'products.filter.categories.batTrangVases' },
  { id: 58902, labelKey: 'products.filter.categories.basketFlowers' },
  { id: 19810, labelKey: 'products.filter.categories.bouquets' },
  { id: 19960, labelKey: 'products.filter.categories.orchids' }
] as const

export const PRICE_MIN = 0
export const PRICE_MAX = 5_000_000
export const PRICE_STEP = 100_000

export const PRICE_RANGES = [
  { min: 0, max: 200_000, labelKey: 'products.filter.priceRanges.r0to200' },
  { min: 200_000, max: 500_000, labelKey: 'products.filter.priceRanges.r200to500' },
  { min: 500_000, max: 1_000_000, labelKey: 'products.filter.priceRanges.r500to1000' },
  { min: 1_000_000, max: 2_000_000, labelKey: 'products.filter.priceRanges.r1000to2000' },
  { min: 2_000_000, max: 5_000_000, labelKey: 'products.filter.priceRanges.r2000to5000' }
] as const

export const PRODUCT_NOT_FOUND_MESSAGE_CODE = 'PRODUCT_NOT_FOUND'
