import configService from '@/services/config.service'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export interface GetPublicConfigsParams {
  group?: string
  key?: string
}

type PublicConfigsQueryOptions<TData> = Pick<
  UseQueryOptions<TData>,
  'staleTime' | 'gcTime' | 'retry' | 'throwOnError' | 'enabled'
>

export const useGetPublicConfigs = <T extends { key: string }, K extends T['key'] = T['key']>({
  group,
  key,
  options
}: {
  group?: string
  key?: K
  options?: PublicConfigsQueryOptions<Extract<T, { key: K }>[]>
} = {}) => {
  const { data, isLoading: isGettingConfigs } = useQuery<Extract<T, { key: K }>[]>({
    queryKey: ['configs', 'content', group, key],
    queryFn: () => configService.getPublicConfigs<Extract<T, { key: K }>>({ group, key }),
    ...options
  })

  const configs = data ?? ([] as Extract<T, { key: K }>[])

  return { configs, isGettingConfigs }
}
