import { GetReferenceFlowersParams } from '@/hooks/use-get-reference-flowers'
import api, { BasePaginationResponse } from '@/lib/axios'

export interface ReferenceFlower {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  type: 'bundle' | 'flower'
  isDeleted: boolean
  createdAt: string
  updatedAt: string | null
}

class ReferenceFlowerService {
  private readonly baseUrl = 'reference-flowers'

  getReferenceFlowers = async ({ pageIndex, isActive, pageSize, search, type }: GetReferenceFlowersParams) => {
    const { data } = await api.get<BasePaginationResponse<ReferenceFlower>>(`v1/${this.baseUrl}`, {
      params: { pageIndex, isActive, pageSize, search, type }
    })

    return data.value
  }
}

const referenceFlowerSerivce = new ReferenceFlowerService()
export default referenceFlowerSerivce
