import type { ShippingQuote } from './types'

/**
 * The free-ship radius is a shop-wide rule, not a carrier one. The threshold
 * still lives under the legacy `ahamove` config group.
 */
export const isWithinFreeShip = (quote: ShippingQuote | undefined, freeShipKm: number): boolean => {
  if (!quote || !Number.isFinite(freeShipKm) || freeShipKm < 0) return false

  return quote.distanceKm >= 0 && quote.distanceKm <= freeShipKm
}

export interface ResolvedShippingFee {
  distanceKm: number
  // What the carrier quoted, before the waiver.
  rawShippingFee: number
  isFreeShip: boolean
  shippingFee: number
  shippingDiscount: number
}

export const resolveShippingFee = (quote: ShippingQuote | undefined, freeShipKm: number): ResolvedShippingFee => {
  const rawShippingFee = quote?.totalFee ?? 0
  const isFreeShip = isWithinFreeShip(quote, freeShipKm)

  return {
    distanceKm: quote?.distanceKm ?? 0,
    rawShippingFee,
    isFreeShip,
    shippingFee: isFreeShip ? 0 : rawShippingFee,
    shippingDiscount: isFreeShip ? rawShippingFee : 0
  }
}
