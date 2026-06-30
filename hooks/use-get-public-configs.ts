import configService from '@/services/config.service'
import { useQuery } from '@tanstack/react-query'

export interface GetPublicConfigsParams {
  group?: string
  key?: string
}

export const useGetPublicConfigs = <T extends { key: string }, K extends T['key'] = T['key']>({
  group,
  key
}: { group?: string; key?: K } = {}) => {
  const { data: configs = [] as Extract<T, { key: K }>[], isLoading: isGettingConfigs } = useQuery<
    Extract<T, { key: K }>[]
  >({
    queryKey: ['configs', 'content', group, key],
    queryFn: () => configService.getPublicConfigs<Extract<T, { key: K }>>({ group, key })
  })

  return { configs, isGettingConfigs }
}
