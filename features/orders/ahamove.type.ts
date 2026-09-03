export interface AhamoveEstimateResult {
  ahamoveResult: AhamoveResult[]
  products: EstimateProduct[]
}

export interface AhamoveResult {
  service_id: string
  data: AhamoveQuoteData
}

export interface AhamoveQuoteData {
  distance: number
  duration: number

  distance_fee: number
  request_fee: number
  stop_fee: number
  vat_fee: number
  discount: number

  total_fee: number
  total_price: number

  requests: AhamoveRequestOption[]
}

export interface AhamoveRequestOption {
  _id: string
  num: number
  price: number
  tier_code: string | null
}

export interface EstimateProduct {
  id: string
  name: string
  retail: number
  weight: number
  length: number
  width: number
  height: number
}
