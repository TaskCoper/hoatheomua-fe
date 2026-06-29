import configService from '@/services/config.service'
import { useQuery } from '@tanstack/react-query'

export const useGetConfigs = <T>({ group }: { group: string }) => {
  const { data: configs = [] as T[], isLoading: isGettingConfigs } = useQuery<T[]>({
    queryKey: ['configs', group],
    queryFn: () => configService.getConfigs<T>({ group })
  })

  return { configs, isGettingConfigs }
}
