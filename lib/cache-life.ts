type CacheLifeProfile = {
  stale: number
  revalidate: number
  expire: number
}

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Price and stock - the freshest-changing data on the site. Matches the 300s
 * ISR window on /products, the home page, and the collection detail pages.
 */
export const PRODUCTS_LIST_LIFE: CacheLifeProfile = {
  stale: MINUTE,
  revalidate: 5 * MINUTE,
  expire: HOUR
}

/** A single product, plus the sitemap's catalogue enumeration. */
export const PRODUCT_DETAIL_LIFE: CacheLifeProfile = {
  stale: 5 * MINUTE,
  revalidate: HOUR,
  expire: DAY
}

/**
 * Editorial and configuration that only changes when an admin saves: articles,
 * categories, company info, public configs, job descriptions. The revalidate
 * webhook purges these by tag on real changes, so the window is a safety net.
 */
export const CONTENT_LIFE: CacheLifeProfile = {
  stale: 5 * MINUTE,
  revalidate: HOUR,
  expire: DAY
}

/** Job listings - posted and closed often enough to warrant a tighter window. */
export const RECRUITMENT_LIST_LIFE: CacheLifeProfile = {
  stale: 2 * MINUTE,
  revalidate: 10 * MINUTE,
  expire: DAY
}
