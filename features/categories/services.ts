import api, { BaseResponse } from '@/lib/axios'
import { Category, CategoryProductPage, SortableCategory } from './types'

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

  getCategory = async ({ id }: { id: string }) => {
    const { data } = await api.get<BaseResponse<Category>>(`v1/${this.baseUrl}/${id}`)

    return data.value
  }
}

const categoryService = new CategoryService()
export default categoryService
