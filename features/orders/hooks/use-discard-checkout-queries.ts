'use client'

import { getMeQuery } from '@/features/users/queries'
import { useQueryClient, type Query } from '@tanstack/react-query'
import { useLayoutEffect } from 'react'

const SESSION_QUERY_KEY = getMeQuery().queryKey

export const useDiscardCheckoutQueries = () => {
  const queryClient = useQueryClient()

  useLayoutEffect(() => {
    const cache = queryClient.getQueryCache()
    const observed = new Set<Query>()

    const unsubscribe = cache.subscribe((event) => {
      if (event.type === 'observerAdded') {
        observed.add(event.query)
      }
    })

    return () => {
      unsubscribe()

      setTimeout(() => {
        observed.forEach((query) => {
          if (query.getObserversCount() === 0 && query.queryKey[0] !== SESSION_QUERY_KEY[0]) {
            cache.remove(query)
          }
        })
      })
    }
  }, [queryClient])
}
