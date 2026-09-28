'use client'

import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { activeCardJob, cardJobs, CARD_JOBS_KEY, type CardJob } from '../card-jobs'
import { orderDetailCardsQueryKey } from '../queries'
import type { GetOrderDetailCardsParams, RegenerateAiCardPayload } from '../types'

type Callbacks = { onSuccess?: () => void; onError?: () => void }

export const useRegenerateAiCard = (params: GetOrderDetailCardsParams, enabled = true) => {
  const { me } = useGetMe()
  const queryClient = useQueryClient()
  const scope = `${me?.id}:${params.orderDetailsId}:${params.virtualId}`
  const listKey = [...CARD_JOBS_KEY, scope]
  const [submitted, setSubmitted] = useState<{ scope: string; id: string } | null>(null)
  const callbacks = useRef<{ scope: string; value: Callbacks } | null>(null)
  const handled = useRef(new Set<string>())
  const submitting = useRef(false)
  const pendingKey = useRef<{ fingerprint: string; key: string } | null>(null)
  const list = useQuery({
    queryKey: listKey,
    queryFn: ({ signal }) => cardJobs.list(params, signal),
    enabled: enabled && Boolean(me?.id),
    refetchInterval: enabled ? 4000 : false,
    retry: 2
  })
  const submittedId = submitted?.scope === scope ? submitted.id : undefined
  const trackedId = submittedId ?? list.data?.find(activeCardJob)?.jobId ?? list.data?.[0]?.jobId
  const detailKey = [...CARD_JOBS_KEY, scope, trackedId]
  const detail = useQuery({
    queryKey: detailKey,
    queryFn: ({ signal }) => cardJobs.get(trackedId!, signal),
    enabled: enabled && Boolean(me?.id && trackedId),
    refetchInterval: (query) => (query.state.data && !activeCardJob(query.state.data) ? false : 3000),
    retry: 2
  })
  const job = detail.data ?? list.data?.find((item) => item.jobId === trackedId)
  const mutation = useMutation({
    mutationFn: ({ body, key }: { body: RegenerateAiCardPayload; key: string }) => cardJobs.submit(body, key),
    retry: false
  })
  const cancel = useMutation({
    mutationFn: (id: string) => cardJobs.cancel(id),
    onSuccess: (next) => {
      queryClient.setQueryData([...CARD_JOBS_KEY, scope, next.jobId], next)
      void queryClient.invalidateQueries({ queryKey: listKey })
    }
  })

  useEffect(() => {
    if (!job || activeCardJob(job) || handled.current.has(job.jobId)) return
    handled.current.add(job.jobId)
    void queryClient.invalidateQueries({ queryKey: orderDetailCardsQueryKey(params) })
    void queryClient.invalidateQueries({ queryKey: [...CARD_JOBS_KEY, scope] })
    if (callbacks.current?.scope === scope) {
      const callback = callbacks.current.value
      callbacks.current = null
      if (job.status === 'Succeeded') callback.onSuccess?.()
      else if (job.status === 'Failed') callback.onError?.()
    }
  }, [job, params, queryClient, scope])

  function regenerateAiCard(body: RegenerateAiCardPayload, nextCallbacks: Callbacks = {}) {
    if (submitting.current || activeCardJob(job) || !me?.id) return
    submitting.current = true
    callbacks.current = { scope, value: nextCallbacks }
    const fingerprint = JSON.stringify({ scope, body })
    const storageKey = `card-submission:${scope}`
    if (pendingKey.current?.fingerprint !== fingerprint) {
      let saved: { fingerprint?: string; key?: string } | null = null
      try {
        saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
      } catch {
        /* storage unavailable */
      }
      pendingKey.current = {
        fingerprint,
        key: saved?.fingerprint === fingerprint && saved.key ? saved.key : crypto.randomUUID()
      }
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(pendingKey.current))
    } catch {
      /* keep in memory */
    }
    mutation.mutate(
      { body, key: pendingKey.current.key },
      {
        onSuccess: (next) => {
          queryClient.setQueryData([...CARD_JOBS_KEY, scope, next.jobId], next)
          handled.current.delete(next.jobId)
          setSubmitted({ scope, id: next.jobId })
          pendingKey.current = null
          try {
            sessionStorage.removeItem(storageKey)
          } catch {
            /* no-op */
          }
          void queryClient.invalidateQueries({ queryKey: listKey })
        },
        onError: () => {
          callbacks.current = null
          nextCallbacks.onError?.()
          void queryClient.invalidateQueries({ queryKey: listKey })
        },
        onSettled: () => {
          submitting.current = false
        }
      }
    )
  }

  return {
    regenerateAiCard,
    isRegeneratingAiCard:
      mutation.isPending ||
      activeCardJob(job) ||
      Boolean(list.data?.some((item) => item.jobId !== job?.jobId && activeCardJob(item))),
    isCheckingJobs: enabled && (list.isPending || list.isError),
    job,
    stage: !job
      ? 0
      : ({ Queued: 0, GeneratingCard: 1, Saving: 2, Completed: 2 } satisfies Record<CardJob['stage'], number>)[
          job.stage
        ],
    isConnectionError: list.isError || detail.isError || cancel.isError,
    cancelJob: () => {
      if (job && activeCardJob(job)) cancel.mutate(job.jobId)
    },
    isCanceling: cancel.isPending || Boolean(job?.cancelRequested)
  }
}
