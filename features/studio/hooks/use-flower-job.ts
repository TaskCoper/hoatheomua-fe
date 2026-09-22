'use client'

import { useGetMe } from '@/features/users/hooks/use-get-me'
import { flowerJobs, isActiveJob, JOBS_KEY, jobStageIndex, type FlowerJob } from '../jobs'
import type { CreateAiFlowerPayload, RegenerateAiFlowerPayload } from '../types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export function useFlowerJob(onFinished: (job: FlowerJob) => void) {
  const { me } = useGetMe()
  const t = useTranslations('studio.jobs')
  const queryClient = useQueryClient()
  const [submitted, setSubmitted] = useState<{ jobId: string; userId: string } | null>(null)
  const handled = useRef<string | null>(null)
  const submitting = useRef(false)
  const pendingKey = useRef<{ fingerprint: string; key: string } | null>(null)
  const callback = useRef(onFinished)
  useEffect(() => {
    callback.current = onFinished
  }, [onFinished])
  const jobId = submitted?.userId === me?.id ? submitted?.jobId : undefined
  const query = useQuery({
    queryKey: [...JOBS_KEY, me?.id, 'detail', jobId],
    queryFn: ({ signal }) => flowerJobs.get(jobId!, signal),
    enabled: Boolean(jobId && me?.id),
    refetchInterval: (query) =>
      query.state.data && !isActiveJob(query.state.data)
        ? false
        : Math.min(3000 * (1 + query.state.fetchFailureCount), 15000),
    refetchIntervalInBackground: false,
    retry: (count, error) => count < 2 && (!error.response || error.response.status >= 500)
  })
  const mutation = useMutation({
    mutationFn: ({
      body,
      key,
      sourceFlowerId
    }: {
      body: CreateAiFlowerPayload | RegenerateAiFlowerPayload
      key: string
      sourceFlowerId?: string
    }) => flowerJobs.submit(body, key, sourceFlowerId),
    retry: false
  })
  const job = query.data
  useEffect(() => {
    if (!job || isActiveJob(job) || handled.current === job.jobId) return
    handled.current = job.jobId
    void queryClient.invalidateQueries({ queryKey: ['generated-flowers'] })
    void queryClient.invalidateQueries({ queryKey: JOBS_KEY })
    if (job.status === 'Succeeded') callback.current(job)
    else if (job.status === 'Failed') toast.error(t('failed'), { description: t('failedNote') })
    else toast.info(t('canceled'))
  }, [job, queryClient, t])

  async function submit(body: CreateAiFlowerPayload | RegenerateAiFlowerPayload, sourceFlowerId?: string) {
    if (submitting.current || (job && isActiveJob(job)) || !me?.id) return
    submitting.current = true
    const fingerprint = JSON.stringify({ userId: me.id, sourceFlowerId, body })
    const storageKey = `flower-submission:${me.id}:${sourceFlowerId ?? 'create'}`
    try {
      // Retain a key across uncertain responses/reloads; never replay an ambiguous POST with a fresh key.
      if (pendingKey.current?.fingerprint !== fingerprint) {
        let saved: { fingerprint?: string; key?: string } | null = null
        try {
          saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
        } catch {
          /* storage may be disabled */
        }
        pendingKey.current = {
          fingerprint,
          key: saved?.fingerprint === fingerprint && saved.key ? saved.key : crypto.randomUUID()
        }
      }
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(pendingKey.current))
      } catch {
        /* in-memory key remains */
      }
      const next = await mutation.mutateAsync({ body, key: pendingKey.current.key, sourceFlowerId })
      queryClient.setQueryData([...JOBS_KEY, me.id, 'detail', next.jobId], next)
      setSubmitted({ jobId: next.jobId, userId: me.id })
      handled.current = null
      pendingKey.current = null
      try {
        sessionStorage.removeItem(storageKey)
      } catch {
        /* no-op */
      }
      void queryClient.invalidateQueries({ queryKey: JOBS_KEY })
    } catch {
      toast.error(t('submitError'), { description: t('submitErrorNote') })
    } finally {
      submitting.current = false
    }
  }

  return {
    submit,
    job,
    generationStage: jobStageIndex(job),
    isPending: mutation.isPending || Boolean(job && isActiveJob(job)),
    isConnectionError: query.isError
  }
}
