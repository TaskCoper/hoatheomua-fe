import api, { BaseResponse } from '@/lib/axios'
import type { Address, AddressPayload } from './types'

class AddressService {
  private readonly baseUrl = 'v1/addresses'

  getAddresses = async () => {
    const { data } = await api.get<BaseResponse<Address[]>>(this.baseUrl)
    return data.value
  }

  getAddressById = async (id: string) => {
    const { data } = await api.get<BaseResponse<Address>>(`${this.baseUrl}/${id}`)
    return data.value
  }

  createAddress = async (body: AddressPayload) => {
    const { data } = await api.post<BaseResponse<Address>>(this.baseUrl, body)
    return data.value
  }

  updateAddress = async ({ id, body }: { id: string; body: AddressPayload }) => {
    const { data } = await api.put<BaseResponse<Address>>(`${this.baseUrl}/${id}`, body)
    return data.value
  }

  deleteAddress = async (id: string) => {
    const { data } = await api.delete<BaseResponse<unknown>>(`${this.baseUrl}/${id}`)
    return data.value
  }

  setDefaultAddress = async (id: string) => {
    const { data } = await api.patch<BaseResponse<Address>>(`${this.baseUrl}/${id}/default`, {})
    return data.value
  }
}

const addressService = new AddressService()
export default addressService
