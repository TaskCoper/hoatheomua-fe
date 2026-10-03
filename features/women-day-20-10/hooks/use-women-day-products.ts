'use client'

import { useGetProducts } from '@/features/products/hooks/use-get-products'
import { WOMEN_DAY_CATEGORY_ID, WOMEN_DAY_PAGE_SIZE } from '@/features/women-day-20-10/constants'

export const useWomenDayProducts = (pageIndex = 1) => {
  return useGetProducts({
    pageIndex,
    pageSize: WOMEN_DAY_PAGE_SIZE,
    categoryIds: [WOMEN_DAY_CATEGORY_ID]
  })
}
