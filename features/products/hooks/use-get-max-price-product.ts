import { useQuery } from '@tanstack/react-query'
import productService from '../services'

export const useGetMaxPriceProduct = ({
  categoryIds,
  enabled = true
}: { categoryIds?: string[]; enabled?: boolean } = {}) => {
  const { data: maxPrice, isLoading: isGettingMaxPriceProduct } = useQuery({
    queryKey: ['products', 'max-price', categoryIds],
    queryFn: () => productService.getMaxPriceProduct({ categoryIds }),
    enabled
  })

  return { maxPrice, isGettingMaxPriceProduct }
}
