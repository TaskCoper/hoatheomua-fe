import api, { BaseResponse } from '@/lib/axios'

class ConfigService {
  private readonly baseUrl = 'configs'

  getConfigs = async <T>({ group }: { group: string }): Promise<T[]> => {
    const { data } = await api.get<BaseResponse<T[]>>(`v1/${this.baseUrl}/group`, {
      params: { groupName: group }
    })

    return data.value
  }
}

const configService = new ConfigService()
export default configService
