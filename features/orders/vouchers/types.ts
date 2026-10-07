export type VoucherDiscountType = 'cash' | 'percent'
export type VoucherVisibility = 'public' | 'private'

export interface PublicVoucherResponse {
  id: string
  code: string
  description: string | null
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minOrderAmount: number | null
  endAt: string
  discountAmount: number
}

export interface EstimateVoucherRequest {
  code: string
  productFee: number
}

export interface EstimateVoucherResponse {
  voucherId: string
  code: string
  description: string | null
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  discountAmount: number
  productFeeAfterDiscount: number
}
