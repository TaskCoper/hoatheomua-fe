'use client'

import * as Sentry from '@sentry/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getMeQuery } from '../queries'

const ME_QUERY_KEY = getMeQuery().queryKey

/**
 * Mirrors the signed-in user into Sentry as `{ id }` only - no email, phone or name.
 *
 * It follows the `['me']` cache entry instead of calling `useGetMe`, so it never adds an observer or a
 * /me request of its own: whichever guard already loads the session drives it. Sign-in and sign-out
 * both end in a hard navigation, so a fresh document starts with no user; sign-out also empties the
 * cache (`queryClient.clear()`), which clears the user here before the reload. The server sets no user:
 * its events are linked to the browser session through the shared trace.
 */
export default function SentryUserContext() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let currentId: string | null = null

    const sync = () => {
      const id = queryClient.getQueryData(ME_QUERY_KEY)?.id ?? null

      if (id === currentId) return

      currentId = id
      Sentry.setUser(id ? { id } : null)
    }

    sync()

    return queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === ME_QUERY_KEY[0]) sync()
    })
  }, [queryClient])

  return null
}
