'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import voucherService from '../service'
import type {
  CheckoutVoucher,
  EstimateVoucherResponse,
  FilterVoucherProduct,
  PublicVoucherResponse,
  VoucherVisibility
} from '../types'

const NO_VOUCHERS: CheckoutVoucher[] = []

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

interface LoadVouchersArgs {
  productsSubtotal: number
  products: FilterVoucherProduct[]
  orderTime: number
}

/**
 * The voucher lists are a mutation, not queries, so there is no cache to serve a
 * stale offer from: every `loadVouchers` call goes to the API, and the previous
 * result is dropped the moment it starts.
 */
export const useCheckoutVouchers = (productsSubtotal: number, orderTime: number) => {
  const { t } = useTranslation()

  const {
    mutate: loadVouchers,
    data: loaded,
    isPending: isLoadingVouchers
  } = useMutation({
    mutationFn: async ({ productsSubtotal, products, orderTime }: LoadVouchersArgs) => {
      const [publicVouchers, filteredVouchers] = await Promise.all([
        productsSubtotal > 0 ? voucherService.getPublicVouchers({ productFee: productsSubtotal, orderTime }) : null,
        // Only feeds the "not yet eligible" rows; losing it must not hide the usable offers.
        products.length > 0 ? voucherService.filterVouchers({ products, orderTime }).catch(() => null) : null
      ])

      const usableIds = new Set(publicVouchers?.map((voucher) => voucher.id))

      return {
        vouchers: (publicVouchers ?? []).map(toPublicVoucher),
        // Without the public list there is no telling what is usable, so nothing
        // can be called unavailable either.
        unavailableVouchers:
          publicVouchers && filteredVouchers
            ? filteredVouchers
                .filter((voucher) => !usableIds.has(voucher.voucherId))
                .map((voucher) => toEstimatedVoucher(voucher, 'public'))
            : NO_VOUCHERS
      }
    },
    onError: (error) => {
      toast.error(t('orders.checkout.voucher.loadError'), {
        description: error.response?.data?.detail
      })
    }
  })

  const privateEstimate = useMutation({
    mutationFn: ({ code, productFee }: { code: string; productFee: number }) =>
      voucherService.estimateVoucher({ code, productFee, orderTime })
  })

  const estimatePrivateVoucher = async (code: string) =>
    toEstimatedVoucher(await privateEstimate.mutateAsync({ code, productFee: productsSubtotal }), 'private')

  return {
    vouchers: loaded?.vouchers ?? NO_VOUCHERS,
    isVouchersReady: loaded !== undefined,
    unavailableVouchers: loaded?.unavailableVouchers ?? NO_VOUCHERS,
    loadVouchers,
    isLoadingVouchers,
    estimatePrivateVoucher,
    isEstimatingPrivate: privateEstimate.isPending
  }
}
