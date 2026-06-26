import { productListQuery, type ProductListParams } from '@/features/products/queries'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'

export type GetProductsParams = ProductListParams

export const useGetProducts = (params: GetProductsParams = {}) => {
  const locale = useLocale()
  const {
    data: products,
    isFetching: isFetchingProducts,
    isLoading: isLoadingProducts
  } = useQuery({
    ...productListQuery(params, locale),
    placeholderData: keepPreviousData
  })

  return { products, isFetchingProducts, isLoadingProducts }
}
