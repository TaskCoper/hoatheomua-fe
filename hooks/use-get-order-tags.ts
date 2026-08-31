import configService from '@/services/config.service'
import type { OrderTag } from '@/types/config.type'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

// Slot labels read like "17h - 19h", so the start hour is the order the user
// expects. Labels without a leading number keep their relative order at the end.
const startHour = (label: string) => {
  const match = label.match(/\d+/)
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER
}

export const useGetOrderTags = () => {
  const { data, isLoading: isGettingOrderTags } = useQuery({
    queryKey: ['configs', 'order-tags'],
    queryFn: configService.getOrderTags
  })

  const orderTags = useMemo<OrderTag | undefined>(() => {
    if (!data?.options?.length) return data

    return {
      ...data,
      options: [...data.options].sort((a, b) => {
        const byHour = startHour(a.label) - startHour(b.label)
        return byHour !== 0 ? byHour : a.label.localeCompare(b.label)
      })
    }
  }, [data])

  return { orderTags, isGettingOrderTags }
}
