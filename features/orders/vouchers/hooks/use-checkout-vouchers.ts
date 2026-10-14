'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import voucherService from '../service'
import type {
  CheckoutVoucher,
  EstimateVoucherResponse,
  FilterVoucherProduct,
  PublicVoucherResponse,
  VoucherVisibility
} from '../types'

const toKind = (type: PublicVoucherResponse['discountType']) => (type === 'cash' ? 'fixed' : 'percent')

const toPublicVoucher = (voucher: PublicVoucherResponse): CheckoutVoucher => ({
  id: voucher.id,
  code: voucher.code,
  description: voucher.description,
  kind: toKind(voucher.discountType),
  value: voucher.discountValue,
  visibility: 'public',
  expiresAt: voucher.endAt ?? '',
  discountAmount: voucher.discountAmount,
  maxDiscountAmount: voucher.maxDiscountAmount,
  minOrderAmount: voucher.minOrderAmount,
  maxOrderAmount: null
})

const toEstimatedVoucher = (
  voucher: EstimateVoucherResponse & { minOrderAmount?: number | null; maxOrderAmount?: number | null },
  visibility: VoucherVisibility
): CheckoutVoucher => ({
  id: voucher.voucherId,
  code: voucher.code,
  description: voucher.description,
  kind: toKind(voucher.discountType),
  value: voucher.discountValue,
  visibility,
  expiresAt: '',
  discountAmount: voucher.discountAmount,
  maxDiscountAmount: voucher.maxDiscountAmount,
  minOrderAmount: voucher.minOrderAmount ?? null,
  maxOrderAmount: voucher.maxOrderAmount ?? null
})

export const useCheckoutVouchers = (productsSubtotal: number, products: FilterVoucherProduct[], orderTime: number) => {
  const publicQuery = useQuery({
    queryKey: ['vouchers', 'public', productsSubtotal, orderTime],
    queryFn: () => voucherService.getPublicVouchers({ productFee: productsSubtotal, orderTime }),
    enabled: productsSubtotal > 0
  })

  const filterQuery = useQuery({
    queryKey: ['vouchers', 'filter', products, orderTime],
    queryFn: () => voucherService.filterVouchers({ products, orderTime }),
    enabled: products.length > 0
  })

  const privateEstimate = useMutation({
    mutationFn: ({ code, productFee }: { code: string; productFee: number }) =>
      voucherService.estimateVoucher({ code, productFee, orderTime })
  })

  const vouchers = useMemo(() => (publicQuery.data ?? []).map(toPublicVoucher), [publicQuery.data])

  const unavailableVouchers = useMemo(() => {
    if (!publicQuery.isSuccess || !filterQuery.data) return []

    const usableIds = new Set(publicQuery.data.map((voucher) => voucher.id))
    return filterQuery.data
      .filter((voucher) => !usableIds.has(voucher.voucherId))
      .map((voucher) => toEstimatedVoucher(voucher, 'public'))
  }, [publicQuery.isSuccess, publicQuery.data, filterQuery.data])

  const estimatePrivateVoucher = async (code: string) =>
    toEstimatedVoucher(await privateEstimate.mutateAsync({ code, productFee: productsSubtotal }), 'private')

  return {
    vouchers,
    isVouchersReady: publicQuery.isSuccess,
    unavailableVouchers,
    estimatePrivateVoucher,
    isEstimatingPrivate: privateEstimate.isPending
  }
}
