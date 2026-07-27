import api, { BaseResponse } from '@/lib/axios'
import { SortableCategory } from './types'

class CategoryService {
  private readonly baseUrl = 'category-products'

  getCategories = async () => {
    const { data } = await api.get<BaseResponse<SortableCategory[]>>(`v1/${this.baseUrl}/with-children`)

    return data.value
  }
}

const categoryService = new CategoryService()
export default categoryService
