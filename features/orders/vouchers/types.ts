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
  endAt: string | null
  discountAmount: number
}

/** A voucher as the checkout shows and applies it, public or estimated from a private code. */
export interface CheckoutVoucher {
  id: string
  code: string
  description: string | null
  kind: 'fixed' | 'percent'
  value: number
  visibility: VoucherVisibility
  expiresAt: string
  discountAmount: number
  maxDiscountAmount: number | null
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
