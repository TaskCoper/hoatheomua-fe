import api, { BasePaginationResponse } from '@/lib/axios'
import type { GeneratedCardItem, GetGeneratedCardsByProductsPayload } from '@/types/generated-card.type'

class GeneratedCardService {
  private readonly baseUrl = 'generated-cards'

  getGeneratedCardsByProducts = async ({
    pageIndex,
    pageSize,
    search,
    productIds
  }: GetGeneratedCardsByProductsPayload) => {
    const { data } = await api.post<BasePaginationResponse<GeneratedCardItem>>(`v1/${this.baseUrl}/by-products`, {
      pageIndex,
      pageSize,
      search,
      productIds
    })

    return data.value
  }
}

const generatedCardService = new GeneratedCardService()
export default generatedCardService
