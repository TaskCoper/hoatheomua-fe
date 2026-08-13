import { PROMO_CLICK_EVENT, PROMO_IMPRESSION_EVENT } from '@/features/promotions/constants'

type PromoEventName = typeof PROMO_IMPRESSION_EVENT | typeof PROMO_CLICK_EVENT

/**
 * Emits a browser `CustomEvent` for impression/click. Not a real analytics
 * platform - subscribe via `window.addEventListener('promo:impression', ...)`.
 */
export const emitPromoEvent = (name: PromoEventName, detail: Record<string, unknown>) => {
  if (typeof window === 'undefined') return

  try {
    window.dispatchEvent(new CustomEvent(name, { detail }))
  } catch {
    // Analytics must never break a render path.
  }
}
