import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import type {
  AiFlower,
  CreateAiFlowerPayload,
  GeneratedFlowerComposition,
  GeneratedFlowerSession,
  GetGeneratedFlowersParams,
  GetMockupGeneratedFlowersParams,
  MockupGeneratedFlower,
  RegenerateAiFlowerPayload
} from './types'

class AiFlowerService {
  private readonly baseUrl = 'v1/ai-flowers'
  private readonly generatedUrl = 'v1/generated-flowers'

  createAiFlower = async ({ body }: { body: CreateAiFlowerPayload }) => {
    const { data } = await api.post<BaseResponse<AiFlower>>(`${this.baseUrl}`, body)

    return data.value
  }

  regenerateAiFlower = async ({ flowerId, body }: { flowerId: string; body: RegenerateAiFlowerPayload }) => {
    const { data } = await api.post<BaseResponse<AiFlower>>(`${this.baseUrl}/${flowerId}/regenerate`, body)

    return data.value
  }

  getGeneratedFlowers = async ({ sessionId, pageIndex, pageSize }: GetGeneratedFlowersParams) => {
    const { data } = await api.get<BasePaginationResponse<GeneratedFlowerSession>>(`${this.generatedUrl}`, {
      params: { sessionId, pageIndex, pageSize }
    })

    return data.value
  }

  /**
   * The gallery of one mockup. Note the path: the id sits directly under `v1`, with no
   * `mockups` segment before it, and the route only matches a GUID - anything else is a 404
   * rather than a 400.
   */
  getMockupGeneratedFlowers = async ({ mockupId, pageIndex, pageSize }: GetMockupGeneratedFlowersParams) => {
    const { data } = await api.get<BasePaginationResponse<MockupGeneratedFlower>>(`v1/${mockupId}/generated-flowers`, {
      params: { pageIndex, pageSize }
    })

    return data.value
  }

  getGeneratedFlowerComposition = async ({ flowerId }: { flowerId: string }) => {
    const { data } = await api.get<BaseResponse<GeneratedFlowerComposition>>(`${this.baseUrl}/${flowerId}/composition`)

    return data.value
  }
}

const aiFlowerService = new AiFlowerService()
export default aiFlowerService
