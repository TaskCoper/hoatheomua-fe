import api, { BaseResponse } from '@/lib/axios'
import { CategoryProductPage, SortableCategory } from './types'

class CategoryService {
  private readonly baseUrl = 'category-products'

  getCategories = async ({ page }: { page?: CategoryProductPage[] } = {}) => {
    const { data } = await api.get<BaseResponse<SortableCategory[]>>(`v1/${this.baseUrl}/with-children`, {
      params: {
        page
      }
    })

    return data.value
  }
}

const categoryService = new CategoryService()
export default categoryService
