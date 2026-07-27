import { useQuery } from '@tanstack/react-query'
import categoryService from '../services'

export const useGetCategories = () => {
  const { data: categories = [], isLoading: isGettingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories
  })

  return { categories, isGettingCategories }
}
