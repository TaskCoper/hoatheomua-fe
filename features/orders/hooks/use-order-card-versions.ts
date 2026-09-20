'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { OrderCardVersion } from '../cards/types'
import { getOrderDetailCardsQuery } from '../queries'

const NO_VERSIONS: OrderCardVersion[] = []

export const useOrderCardVersions = ({
  orderDetailsId,
  virtualId,
  enabled = true
}: {
  orderDetailsId: string
  virtualId: string
  enabled?: boolean
}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    ...getOrderDetailCardsQuery({ orderDetailsId, virtualId }),
    enabled: enabled && !!orderDetailsId && !!virtualId
  })

  const versions = useMemo<OrderCardVersion[]>(
    () =>
      data?.map((item, index) => ({ id: item.id, label: index + 1, name: item.name, imageUrl: item.imageUrl })) ??
      NO_VERSIONS,
    [data]
  )

  return { versions, isLoadingVersions: isLoading, isVersionsError: isError, refetchVersions: refetch }
}
