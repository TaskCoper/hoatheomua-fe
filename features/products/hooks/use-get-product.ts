import { useQuery } from '@tanstack/react-query'
import productService from '../services'

export const buildGetProductKey = (id?: string) => ['product', id] as const

export const useGetProduct = ({ id }: { id?: string }) => {
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: buildGetProductKey(id),
    queryFn: () => productService.getProduct({ id }),
    enabled: !!id
  })

  return { product, isLoadingProduct }
}
