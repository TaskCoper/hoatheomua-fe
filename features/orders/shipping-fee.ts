import type { ShippingQuote } from './types'

// VND charged per km beyond the free-ship radius.
export const SHIPPING_FEE_PER_KM = 5000

/**
 * The customer-facing fee is ours, not the carrier's: only the quoted distance is
 * taken from Ahamove / XanhSM. The free-ship radius is a shop-wide rule that still
 * lives under the legacy `ahamove` config group.
 *
 * An unreadable radius (config not loaded) counts as no free radius rather than NaN.
 */
export const calculateShippingFee = (quote: ShippingQuote | undefined, freeShipKm: number): number => {
  if (!quote) return 0

  const freeRadiusKm = Number.isFinite(freeShipKm) && freeShipKm > 0 ? freeShipKm : 0

  // Whole dong - a fractional km would otherwise leak float noise into the payload.
  return Math.round(Math.max(0, quote.distanceKm - freeRadiusKm) * SHIPPING_FEE_PER_KM)
}

export interface ResolvedShippingFee {
  distanceKm: number
  isFreeShip: boolean
  shippingFee: number
}

export const resolveShippingFee = (quote: ShippingQuote | undefined, freeShipKm: number): ResolvedShippingFee => {
  const shippingFee = calculateShippingFee(quote, freeShipKm)

  return {
    distanceKm: quote?.distanceKm ?? 0,
    isFreeShip: !!quote && shippingFee === 0,
    shippingFee
  }
}
