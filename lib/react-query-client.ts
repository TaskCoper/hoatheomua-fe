import { defaultShouldDehydrateQuery, environmentManager, QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ErrorResponse } from './axios'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError<ErrorResponse>
  }
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: (error) => {
          if (error.response?.status === 401) {
            if (
              // If access token is expired => axios interceptors
              // If access token is invalid => layout will handle it
              error.response.data.messageCode === 'MissingAccessToken' ||
              error.response.data.messageCode === 'ExpiredAccessToken' ||
              error.response.data.messageCode === 'InvalidAccessToken'
            ) {
              return false
            }
          }

          return true
        },
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 400/401/403/404/500
          if (
            error.response?.status === 400 ||
            error.response?.status === 401 ||
            error.response?.status === 403 ||
            error.response?.status === 404 ||
            error.response?.status === 500
          )
            return false

          return failureCount < 1
        },
        retryDelay: 3000,
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000
      },
      dehydrate: {
        // Ship server-prefetched queries even if they are still `pending` so the
        // client can pick them up via `<HydrationBoundary>` instead of refetching.
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending'
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

/**
 * Server-safe accessor (no `'use client'`). On the server a fresh client per
 * request prevents cross-request cache leaks; in the browser a single client is
 * memoised so React doesn't throw it away during Suspense replays.
 */
export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient()
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
