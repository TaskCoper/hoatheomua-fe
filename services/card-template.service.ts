import { GetCardTemplatesParams } from '@/hooks/use-get-card-templates'
import api, { BasePaginationResponse } from '@/lib/axios'
import type { CardTemplate } from '@/types/card-template.type'

class CardTemplateService {
  private readonly baseUrl = 'card-templates'

  getCardTemplates = async ({
    pageIndex,
    pageSize,
    isActive,
    templateType,
    search,
    productIds
  }: GetCardTemplatesParams) => {
    const { data } = await api.get<BasePaginationResponse<CardTemplate>>(`v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        isActive,
        templateType,
        search,
        productIds
      }
    })

    return data.value
  }
}

const cardTemplateService = new CardTemplateService()
export default cardTemplateService
