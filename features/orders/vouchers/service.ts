import api, { BaseResponse } from '@/lib/axios'
import type { EstimateVoucherRequest, EstimateVoucherResponse, PublicVoucherResponse } from './types'

class VoucherService {
  getPublicVouchers = async ({ productFee }: { productFee?: number } = {}) => {
    const { data } = await api.get<BaseResponse<PublicVoucherResponse[]>>('v1/vouchers/public', {
      params: { productFee }
    })

    return data.value
  }

  estimateVoucher = async (body: EstimateVoucherRequest) => {
    const { data } = await api.post<BaseResponse<EstimateVoucherResponse>>('v1/vouchers/estimate', body)

    return data.value
  }
}

const voucherService = new VoucherService()
export default voucherService
