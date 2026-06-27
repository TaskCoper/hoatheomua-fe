import { queryOptions } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import userService from './services'

export const getMeQuery = () =>
  queryOptions({
    queryKey: ['me'] as const,
    // Treat 401 as a successful "no session" result so React Query caches it
    // and observer remounts don't keep refiring /me → /refresh_token.
    queryFn: async () => {
      try {
        return await userService.getMe()
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        throw error
      }
    }
  })
