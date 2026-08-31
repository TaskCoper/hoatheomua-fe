'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { getQueryClient } from './react-query-client'

const ReactQueryDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : dynamic(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })), {
        ssr: false
      })

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
