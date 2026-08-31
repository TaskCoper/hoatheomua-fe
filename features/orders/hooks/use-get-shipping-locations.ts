import { useQuery } from '@tanstack/react-query'
import { getShippingLocationsQuery } from '../queries'
import type { ShippingLocationType } from '../types'

interface UseGetShippingLocationsParams {
  type: ShippingLocationType
  parentId?: number
  enabled?: boolean
}

export const useGetShippingLocations = ({ type, parentId, enabled = true }: UseGetShippingLocationsParams) => {
  const { data: shippingLocations = [], isLoading: isLoadingShippingLocations } = useQuery({
    ...getShippingLocationsQuery({ type, parentId }),
    enabled
  })

  return { shippingLocations, isLoadingShippingLocations }
}
