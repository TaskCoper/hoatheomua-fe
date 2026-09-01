import { GetPublicConfigsParams } from '@/hooks/use-get-public-configs'
import api, { BaseResponse } from '@/lib/axios'
import { OrderTag } from '@/types/config.type'

class ConfigService {
  private readonly baseUrl = 'configs'

  getPublicConfigs = async <T>({ group, key }: GetPublicConfigsParams) => {
    const { data } = await api.get<BaseResponse<T[]>>(`v1/${this.baseUrl}/public`, {
      params: { groupName: group, key }
    })

    return data.value
  }

  getOrderTags = async () => {
    const { data } = await api.get<BaseResponse<OrderTag>>(`v1/${this.baseUrl}/order-tags`)

    return data.value
  }
}

const configService = new ConfigService()
export default configService
