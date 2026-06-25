import { useQuery } from '@tanstack/react-query'
import userService from '../services'

export const useGetUser = (id: string | undefined) => {
  const { data: user, isPending, isFetching } = useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
    retry: false
  })

  return { user, isLoading: isPending || isFetching }
}
