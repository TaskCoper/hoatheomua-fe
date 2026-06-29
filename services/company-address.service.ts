import { api, type BaseResponse } from '@/lib/axios'
import { CompanyAddress } from '@/types/company-address.type'

class CompanyAddressService {
  private readonly baseUrl = 'company-addresses'

  getCompanyAddress = async () => {
    const { data } = await api.get<BaseResponse<CompanyAddress | null>>(`/v1/${this.baseUrl}`)

    return data.value
  }
}

const companyAddressService = new CompanyAddressService()
export default companyAddressService
