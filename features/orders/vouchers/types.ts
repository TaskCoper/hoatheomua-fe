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
  minOrderAmount: number | null
  maxOrderAmount: number | null
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

export interface FilterVoucherProduct {
  id: string
  quantity: number
}

export interface FilterVoucherRequest {
  products: FilterVoucherProduct[]
}

export interface FilterVoucherResponse extends EstimateVoucherResponse {
  minOrderAmount: number | null
  maxOrderAmount: number | null
  isValid: boolean
}
