import referenceFlowerSerivce from '@/services/reference-flower.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQuery } from '@tanstack/react-query'

export interface GetReferenceFlowersParams {
  pageSize?: number
  pageIndex?: number
  type?: 'bundle' | 'flower'
  search?: string
  isActive?: boolean
}

export const useGetReferenceFlowers = ({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  type,
  search,
  isActive = true
}: GetReferenceFlowersParams) => {
  const { data: referenceFlowers, isLoading: isGettingReferenceFlowers } = useQuery({
    queryKey: ['reference-flowers', pageIndex, isActive, pageSize, search, type],
    queryFn: () => referenceFlowerSerivce.getReferenceFlowers({ pageIndex, isActive, pageSize, search, type })
  })

  return { referenceFlowers, isGettingReferenceFlowers }
}
