import type { AhamoveEstimateResult } from '../ahamove.type'
import { ShippingGateway, type ShippingQuote } from '../types'
import type { XanhSmEstimateResult } from '../xanhsm.type'

export const toAhamoveQuotes = (result: AhamoveEstimateResult): ShippingQuote[] =>
  (result.ahamoveResult ?? []).map((entry) => ({
    serviceId: entry.service_id,
    shippingGateway: ShippingGateway.Ahamove,
    distanceKm: entry.data?.distance ?? 0,
    durationSeconds: entry.data?.duration ?? 0,
    totalFee: entry.data?.total_fee ?? 0
  }))

export const toXanhSmQuotes = (result: XanhSmEstimateResult): ShippingQuote[] => [
  {
    serviceId: null,
    shippingGateway: ShippingGateway.XanhSm,
    distanceKm: result.distanceUnit?.toLowerCase() === 'm' ? (result.distance ?? 0) / 1000 : (result.distance ?? 0),
    durationSeconds: result.duration ?? 0,
    totalFee: result.shippingFee ?? 0
  }
]
