import { productDetailQuery } from '@/features/products/queries'
import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'

export const useGetProduct = ({ id }: { id?: string }) => {
  const locale = useLocale()
  const { data: envelope, isLoading: isLoadingProduct } = useQuery({
    ...productDetailQuery(id ?? '', locale),
    enabled: !!id
  })

  const product = envelope?.value?.data ?? null

  return { product, isLoadingProduct }
}
