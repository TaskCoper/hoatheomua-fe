import { useQuery } from '@tanstack/react-query'
import categoryService from '../services'
import { CategoryProductPage } from '../types'

export const useGetCategories = ({ page }: { page?: CategoryProductPage[] } = {}) => {
  const { data: categories = [], isLoading: isGettingCategories } = useQuery({
    queryKey: ['categories', page],
    queryFn: () => categoryService.getCategories({ page })
  })

  return { categories, isGettingCategories }
}
