import api, { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import type {
  GeneratedCardHistoryItem,
  GetGeneratedCardsByProductsPayload,
  GetGeneratedCardsParams,
  ProductGeneratedCards
} from '@/types/generated-card.type'

class GeneratedCardService {
  private readonly baseUrl = 'generated-cards'

  /** Every card the signed-in customer has generated, newest first. */
  getGeneratedCards = async ({ pageIndex, pageSize }: GetGeneratedCardsParams) => {
    const { data } = await api.get<BasePaginationResponse<GeneratedCardHistoryItem>>(`v1/${this.baseUrl}`, {
      params: { pageIndex, pageSize }
    })

    return data.value
  }

  /** Every card generated for the given products - one row per product, no paging. */
  getGeneratedCardsByProducts = async ({ productIds }: GetGeneratedCardsByProductsPayload) => {
    const { data } = await api.post<BaseResponse<ProductGeneratedCards[]>>(`v1/${this.baseUrl}/by-products`, {
      productIds
    })

    return data.value
  }
}

const generatedCardService = new GeneratedCardService()
export default generatedCardService
