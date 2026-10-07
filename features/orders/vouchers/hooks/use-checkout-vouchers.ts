'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import voucherService from '../service'
import { USE_MOCK_VOUCHERS } from '../config'
import { MOCK_VOUCHERS, type MockVoucher } from '../mock-data'
import type { EstimateVoucherResponse, PublicVoucherResponse } from '../types'

const toMockKind = (type: PublicVoucherResponse['discountType']) => (type === 'cash' ? 'fixed' : 'percent')

const toDateLabel = (value: string) => value.slice(0, 10)

const toPublicVoucher = (voucher: PublicVoucherResponse): MockVoucher => ({
  id: voucher.id,
  code: voucher.code,
  nameKey: 'orders.checkout.voucher.apiOffer',
  descriptionKey: 'orders.checkout.voucher.apiDescription',
  description: voucher.description,
  kind: toMockKind(voucher.discountType),
  value: voucher.discountValue,
  visibility: 'public',
  expiresAt: toDateLabel(voucher.endAt),
  discountAmount: voucher.discountAmount,
  maxDiscountAmount: voucher.maxDiscountAmount
})

const toPrivateVoucher = (voucher: EstimateVoucherResponse): MockVoucher => ({
  id: voucher.voucherId,
  code: voucher.code,
  nameKey: 'orders.checkout.voucher.apiOffer',
  descriptionKey: 'orders.checkout.voucher.apiDescription',
  description: voucher.description,
  kind: toMockKind(voucher.discountType),
  value: voucher.discountValue,
  visibility: 'private',
  expiresAt: '',
  discountAmount: voucher.discountAmount
})

export const useCheckoutVouchers = (productsSubtotal: number) => {
  const publicQuery = useQuery({
    queryKey: ['vouchers', 'public', productsSubtotal],
    queryFn: () => voucherService.getPublicVouchers({ productFee: productsSubtotal }),
    enabled: !USE_MOCK_VOUCHERS && productsSubtotal > 0
  })

  const privateEstimate = useMutation({
    mutationFn: ({ code, productFee }: { code: string; productFee: number }) =>
      voucherService.estimateVoucher({ code, productFee })
  })

  const vouchers = useMemo(
    () => (USE_MOCK_VOUCHERS ? MOCK_VOUCHERS : (publicQuery.data ?? []).map(toPublicVoucher)),
    [publicQuery.data]
  )

  const estimatePrivateVoucher = async (code: string) => {
    if (USE_MOCK_VOUCHERS) {
      const voucher = MOCK_VOUCHERS.find((item) => item.visibility === 'private' && item.code === code)
      if (!voucher) throw new Error('Voucher not found')
      return voucher
    }

    return toPrivateVoucher(await privateEstimate.mutateAsync({ code, productFee: productsSubtotal }))
  }

  return {
    vouchers,
    estimatePrivateVoucher,
    isLoading: !USE_MOCK_VOUCHERS && publicQuery.isLoading,
    isEstimatingPrivate: privateEstimate.isPending
  }
}
