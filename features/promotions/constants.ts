export const PROMOTIONS_GROUP = 'promotions'

export const PROMOTION_POPUP_KEY = 'promotions.popup'

export const BUSINESS_TIMEZONE = 'Asia/Ho_Chi_Minh'

// Measured from the moment the config resolves: a settling beat so the popup
// doesn't snap open over a page that is still painting.
export const POPUP_DELAY_MS = 1200

// Config resolving later than this after eligibility means the visitor is already reading; skip.
export const ABANDON_AFTER_MS = 10_000

/** Nobody pages past five promos, and the cap bounds a config-authoring mistake. */
export const MAX_VISIBLE_CAMPAIGNS = 5

export const DISMISS_STORAGE_KEY = 'htm:promo-popup:dismissed'

export const DEFAULT_POPUP_FREQUENCY = 'once-per-session'

export const AUTH_MODAL_PATHS: readonly string[] = ['/sign-in']

export const POLICY_PAGE_PATHS: readonly string[] = ['/delivery', '/ordering', '/privacy', '/returns', '/terms']

export const DEFAULT_POPUP_PAGES: readonly string[] = [
  '*',
  '!/products/*',
  ...POLICY_PAGE_PATHS.map((path) => `!${path}`)
]

export const ALLOWED_IMAGE_HOSTS: readonly string[] = [
  'pos.nvncdn.com',
  'hoatheomua.net',
  'taskcoper.hcm.ss.bfcplatform.vn'
]

export const PROMO_IMPRESSION_EVENT = 'promo:impression'

export const PROMO_CLICK_EVENT = 'promo:click'

// Hosts treated as "us", since localhost/preview origins never match production.
export const SITE_HOSTS = ['hoatheomua.com', 'hoatheomua.net']
