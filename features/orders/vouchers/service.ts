import api, { BaseResponse } from '@/lib/axios'
import type {
  EstimateVoucherRequest,
  EstimateVoucherResponse,
  FilterVoucherRequest,
  FilterVoucherResponse,
  PublicVoucherResponse
} from './types'

class VoucherService {
  getPublicVouchers = async ({ productFee, orderTime }: { productFee?: number; orderTime?: number } = {}) => {
    const { data } = await api.get<BaseResponse<PublicVoucherResponse[]>>('v1/vouchers/public', {
      params: { productFee, orderTime }
    })

    return data.value
  }

  filterVouchers = async ({ products, orderTime }: FilterVoucherRequest) => {
    const { data } = await api.post<BaseResponse<FilterVoucherResponse[]>>('v1/vouchers/filter', {
      products,
      orderTime
    })

    return data.value
  }

  estimateVoucher = async ({ code, productFee, orderTime }: EstimateVoucherRequest) => {
    const { data } = await api.get<BaseResponse<EstimateVoucherResponse>>('v1/vouchers/estimate', {
      params: { code, productFee, orderTime }
    })

    return data.value
  }
}

const voucherService = new VoucherService()
export default voucherService
