import type { I18nKey } from '@/lib/i18n/types'

/**
 * TEMPORARY - the store is still in development, so every flow that can create a
 * real transaction or a third-party side effect is switched off from here.
 * Browsing, search/filter, variants, cart, auth and profile are untouched.
 *
 *   ordering         - order creation: buy now, checkout, place/confirm order,
 *                      order cancellation (it unwinds a real order upstream).
 *   payment          - payment gateways: gateway redirects, payment sessions,
 *                      transferable QR codes.
 *   externalServices - third-party side effects: Ahamove / Xanh SM shipping,
 *                      shipment creation, order SMS/email, order webhooks.
 *
 * Set per environment; `true` (or `1`) turns a flow back on:
 *
 *   NEXT_PUBLIC_ENABLE_ORDERING=true
 *   NEXT_PUBLIC_ENABLE_PAYMENT=true
 *   NEXT_PUBLIC_ENABLE_EXTERNAL_SERVICES=true
 *
 * `NEXT_PUBLIC_` is required, not cosmetic: proxy.ts, the checkout mutations and
 * the buttons all read the same flag, and the browser only ever sees variables
 * with that prefix. Next inlines them at build time, so a container has to be
 * rebuilt - not just restarted - for a change to land, and the Docker build args
 * in .docker/compose.yaml have to carry them through.
 *
 * Unset means off. A forgotten variable must not be the thing that puts real
 * orders and payments back on.
 */
const isEnabled = (value: string | undefined) => {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'true' || normalized === '1'
}

// Read as whole literals - Next only inlines `process.env.NEXT_PUBLIC_*` where it
// can see the complete expression in the source.
export const ENABLE_ORDERING = isEnabled(process.env.NEXT_PUBLIC_ENABLE_ORDERING)
export const ENABLE_PAYMENT = isEnabled(process.env.NEXT_PUBLIC_ENABLE_PAYMENT)
export const ENABLE_EXTERNAL_SERVICES = isEnabled(process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_SERVICES)

export type BusinessFeature = 'ordering' | 'payment' | 'externalServices'

const FEATURE_ENABLED: Record<BusinessFeature, boolean> = {
  ordering: ENABLE_ORDERING,
  payment: ENABLE_PAYMENT,
  externalServices: ENABLE_EXTERNAL_SERVICES
}

/** The one check both the UI (to disable) and the handlers (to refuse) go through. */
export const isFeatureEnabled = (...features: BusinessFeature[]) =>
  features.every((feature) => FEATURE_ENABLED[feature])

/** Customer-facing copy. The buyer never hears about flags or configuration. */
export const FEATURE_UNAVAILABLE_KEY: I18nKey = 'common.featureUnavailable'

/**
 * True until the store is fully live. Drives the stripe above the nav and the
 * header spacer that reserves room for it, so the notice retires by itself the
 * moment all three flags go back to `true`.
 */
export const IS_UNDER_DEVELOPMENT = !isFeatureEnabled('ordering', 'payment', 'externalServices')

export class FeatureUnavailableError extends Error {
  readonly feature: BusinessFeature

  constructor(feature: BusinessFeature) {
    // Plain language on purpose - this can end up in a toast description.
    super('This feature is temporarily unavailable.')
    this.name = 'FeatureUnavailableError'
    this.feature = feature
  }
}

/**
 * Backstop for the mutations. A disabled button is not enough: the request must
 * not leave the browser even if the handler is reached some other way.
 */
export const assertFeatureEnabled = (feature: BusinessFeature) => {
  if (!FEATURE_ENABLED[feature]) {
    throw new FeatureUnavailableError(feature)
  }
}

/**
 * Routes that exist only to create an order. Blocked in `proxy.ts` while
 * ordering is off so a typed-in URL cannot reach them either. Paths are
 * locale-stripped, matching `stripLocale` in the middleware.
 */
export const ORDERING_ROUTE_PATHS = new Set(['/checkout'])

/** Safe landing spot for someone who navigated straight at a blocked route. */
export const ORDERING_DISABLED_REDIRECT_PATH = '/cart'

export const isOrderingBlockedPath = (pathname: string) =>
  !isFeatureEnabled('ordering') && ORDERING_ROUTE_PATHS.has(pathname)
