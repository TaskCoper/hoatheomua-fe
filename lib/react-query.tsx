'use client'

import { environmentManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AxiosError } from 'axios'
import { ErrorResponse } from './axios'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError<ErrorResponse>
  }
}

function makeQueryClient() {
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
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (environmentManager.isServer()) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
