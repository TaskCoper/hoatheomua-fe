import { useQuery } from '@tanstack/react-query'
import productService from '../services'

export const useGetProduct = ({ id }: { id?: string }) => {
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct({ id }),
    enabled: !!id
  })

  return { product, isLoadingProduct }
}
