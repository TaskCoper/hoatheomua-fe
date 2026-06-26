import { useQuery } from '@tanstack/react-query'
import userService from '../services'

export const useGetUser = (slug: string | undefined) => {
  const { data: user, isPending, isFetching } = useQuery({
    queryKey: ['users', slug],
    queryFn: () => userService.getUserBySlug(slug!),
    enabled: !!slug,
    retry: false
  })

  return { user, isLoading: isPending || isFetching }
}
