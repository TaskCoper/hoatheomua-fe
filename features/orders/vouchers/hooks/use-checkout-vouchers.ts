'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import voucherService from '../service'
import type { CheckoutVoucher, EstimateVoucherResponse, PublicVoucherResponse } from '../types'

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
  maxDiscountAmount: voucher.maxDiscountAmount
})

const toPrivateVoucher = (voucher: EstimateVoucherResponse): CheckoutVoucher => ({
  id: voucher.voucherId,
  code: voucher.code,
  description: voucher.description,
  kind: toKind(voucher.discountType),
  value: voucher.discountValue,
  visibility: 'private',
  expiresAt: '',
  discountAmount: voucher.discountAmount,
  maxDiscountAmount: voucher.maxDiscountAmount
})

export const useCheckoutVouchers = (productsSubtotal: number) => {
  const publicQuery = useQuery({
    queryKey: ['vouchers', 'public', productsSubtotal],
    queryFn: () => voucherService.getPublicVouchers({ productFee: productsSubtotal }),
    enabled: productsSubtotal > 0
  })

  const privateEstimate = useMutation({
    mutationFn: ({ code, productFee }: { code: string; productFee: number }) =>
      voucherService.estimateVoucher({ code, productFee })
  })

  const vouchers = useMemo(() => (publicQuery.data ?? []).map(toPublicVoucher), [publicQuery.data])

  const estimatePrivateVoucher = async (code: string) =>
    toPrivateVoucher(await privateEstimate.mutateAsync({ code, productFee: productsSubtotal }))

  return {
    vouchers,
    estimatePrivateVoucher,
    isEstimatingPrivate: privateEstimate.isPending
  }
}
