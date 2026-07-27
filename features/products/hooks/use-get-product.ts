import { productDetailQuery } from '@/features/products/queries'
import { useQuery } from '@tanstack/react-query'

export const useGetProduct = ({ id }: { id?: string }) => {
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    ...productDetailQuery(id ?? ''),
    enabled: !!id
  })

  return { product, isLoadingProduct }
}
