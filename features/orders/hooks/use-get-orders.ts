import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getOrdersQuery } from '../queries'
import type { GetOrdersParams } from '../types'

export const useGetOrders = ({ pageSize, status }: Omit<GetOrdersParams, 'pageIndex'> = {}) => {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getOrdersQuery({ pageSize, status })
  )

  const orders = useMemo(() => data?.pages.flatMap((page) => page.value.items) ?? [], [data])
  const totalCount = data?.pages[0]?.value.totalCount ?? orders.length

  return {
    orders,
    totalCount,
    isLoadingOrders: isLoading,
    isLoadingMoreOrders: isFetchingNextPage,
    hasMoreOrders: hasNextPage,
    loadMoreOrders: fetchNextPage
  }
}
