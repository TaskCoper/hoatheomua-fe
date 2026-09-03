/**
 * POST /v1/xanhsm/estimate. Unlike Ahamove - which quotes every service id it
 * offers and itemises the fee - XanhSM prices the trip as a whole and hands back
 * one already-totalled fee with no service id attached.
 */
export interface XanhSmEstimateResult {
  shippingFee: number
  currencyCode: string
  distance: number
  // 'km' in everything seen so far; the normalizer still honours it so a metres
  // response cannot silently break the free-ship radius.
  distanceUnit: string
  duration: number
  orderTime: number
  expiresAt: number
}
