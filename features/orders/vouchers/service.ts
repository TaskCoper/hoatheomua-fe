import api, { BaseResponse } from '@/lib/axios'
import type {
  EstimateVoucherRequest,
  EstimateVoucherResponse,
  FilterVoucherResponse,
  PublicVoucherResponse
} from './types'

class VoucherService {
  getPublicVouchers = async ({ productFee }: { productFee?: number } = {}) => {
    const { data } = await api.get<BaseResponse<PublicVoucherResponse[]>>('v1/vouchers/public', {
      params: { productFee }
    })

    return data.value
  }

  filterVouchers = async ({ productIds }: { productIds: string[] }) => {
    const { data } = await api.get<BaseResponse<FilterVoucherResponse[]>>('v1/vouchers/filter', {
      params: { productIds }
    })

    return data.value
  }

  estimateVoucher = async ({ code, productFee }: EstimateVoucherRequest) => {
    const { data } = await api.get<BaseResponse<EstimateVoucherResponse>>('v1/vouchers/estimate', {
      params: { code, productFee }
    })

    return data.value
  }
}

const voucherService = new VoucherService()
export default voucherService
