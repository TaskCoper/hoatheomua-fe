'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { sellableQuantityQuery } from '../queries'
import { buildSellableQuantityMap } from '../stock'

export interface GetProductsSellableQuantityParams {
  productIds: string[]
  enabled?: boolean
}

/**
 * Live stock for a set of products. Product and cart pages render from cached
 * HTML/queries whose `sellableQuantity` can be an hour old, so this re-reads the
 * number from the API on mount and whenever the tab regains focus.
 */
export const useGetProductsSellableQuantity = ({ productIds, enabled = true }: GetProductsSellableQuantityParams) => {
  const ids = useMemo(() => Array.from(new Set(productIds.filter(Boolean))).sort(), [productIds])

  const {
    data: sellableQuantities,
    isLoading: isGettingSellableQuantity,
    isFetching: isFetchingSellableQuantity,
    refetch: refetchSellableQuantity
  } = useQuery({
    ...sellableQuantityQuery(ids),
    enabled: enabled && ids.length > 0,
    refetchOnWindowFocus: true
  })

  const sellableQuantityById = useMemo(() => buildSellableQuantityMap(sellableQuantities), [sellableQuantities])

  return {
    sellableQuantities,
    sellableQuantityById,
    isGettingSellableQuantity,
    isFetchingSellableQuantity,
    refetchSellableQuantity
  }
}
