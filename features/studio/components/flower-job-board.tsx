'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useDateFormat } from '@/lib/date'
import { Link } from '@/lib/i18n/navigation'
import PreviewImage from '@/shared/components/preview-image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { flowerJobs, isActiveJob, JOBS_KEY, type FlowerJob } from '../jobs'

export default function FlowerJobBoard({ hideCompleted = false }: { hideCompleted?: boolean }) {
  const t = useTranslations('studio.jobs')
  const { me } = useGetMe()
  const { formatDate } = useDateFormat()
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const list = useQuery({
    queryKey: [...JOBS_KEY, me?.id, 'list', page],
    queryFn: ({ signal }) => flowerJobs.list(page, signal),
    enabled: Boolean(me?.id),
    refetchInterval: (query) => (query.state.data?.items.some(isActiveJob) ? 5000 : 15000),
    refetchIntervalInBackground: false,
    retry: 1
  })
  const detail = useQuery({
    queryKey: [...JOBS_KEY, me?.id, 'detail', selectedId],
    queryFn: ({ signal }) => flowerJobs.get(selectedId!, signal),
    enabled: Boolean(me?.id && selectedId),
    refetchInterval: (query) => (query.state.data && !isActiveJob(query.state.data) ? false : 3000),
    refetchIntervalInBackground: false,
    retry: 1
  })
  const queryClient = useQueryClient()
  const cancel = useMutation({
    mutationFn: flowerJobs.cancel,
    onSuccess: (job) => {
      queryClient.setQueryData([...JOBS_KEY, me?.id, 'detail', job.jobId], job)
      void queryClient.invalidateQueries({ queryKey: JOBS_KEY })
    },
    onError: () => toast.error(t('cancelError'))
  })
  const selected = selectedId ? (detail.data ?? list.data?.items.find((job) => job.jobId === selectedId)) : undefined
  const visibleJobs = list.data?.items.filter((job) => !hideCompleted || job.status !== 'Succeeded')
  const completedJobIds = list.data?.items
    .filter((job) => job.status === 'Succeeded')
    .map((job) => job.jobId)
    .join(',')
  useEffect(() => {
    if (hideCompleted && completedJobIds) {
      void queryClient.invalidateQueries({ queryKey: ['generated-flowers'] })
    }
  }, [hideCompleted, completedJobIds, queryClient])
  useEffect(() => {
    if (selected?.status === 'Succeeded') void queryClient.invalidateQueries({ queryKey: ['generated-flowers'] })
  }, [selected?.jobId, selected?.status, queryClient])
  if (!me?.id) return null
  if (!list.isError && !visibleJobs?.length && page === 1 && !list.data?.hasNextPage) return null

  const label = (job: FlowerJob) =>
    job.cancelRequested && isActiveJob(job)
      ? t('canceling')
      : isActiveJob(job)
        ? t(`stages.${job.stage}`)
        : t(`statuses.${job.status}`)

  return (
    <section className='mx-auto w-full max-w-7xl space-y-3 p-4 sm:p-6' aria-label={t('title')}>
      <h2 className='font-title text-lg font-semibold text-primary'>{t('title')}</h2>
      <p className='text-sm text-muted-foreground'>{t('leaveNote')}</p>
      {list.isError ? (
        <p role='status' className='text-sm'>
          {t('connectionError')}{' '}
          <Button type='button' variant='ghost' onClick={() => void list.refetch()}>
            {t('refresh')}
          </Button>
        </p>
      ) : null}
      <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {visibleJobs?.map((job) => (
          <li key={job.jobId}>
            <button
              type='button'
              onClick={() => setSelectedId(job.jobId)}
              className='flex w-full gap-3 rounded-xl border p-3 text-left hover:bg-secondary/30 focus-visible:outline-2 focus-visible:outline-primary'
            >
              <PreviewImage
                src={job.productImageUrl}
                alt={job.displayName}
                sizes='64px'
                className='size-16 shrink-0 rounded-lg'
              />
              <span className='min-w-0 flex-1 space-y-1'>
                <span className='block truncate font-semibold'>{job.displayName}</span>
                <span className='block text-xs text-muted-foreground'>
                  {t(`types.${job.type}`)} · {formatDate(job.createdAt, 'dateTimeShort')}
                </span>
                <span className='block text-sm'>{label(job)}</span>
                <span className='block text-xs underline'>{t('view')}</span>
              </span>
              {job.mockupImageUrl ? (
                <PreviewImage
                  src={job.mockupImageUrl}
                  alt={t('mockup')}
                  sizes='48px'
                  className='size-12 shrink-0 rounded-lg'
                />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {page > 1 || list.data?.hasNextPage ? (
        <div className='flex gap-2'>
          <Button type='button' variant='outline' disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            {t('previous')}
          </Button>
          <Button
            type='button'
            variant='outline'
            disabled={!list.data?.hasNextPage}
            onClick={() => setPage((value) => value + 1)}
          >
            {t('next')}
          </Button>
        </div>
      ) : null}
      <Dialog
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.displayName ?? t('title')}</DialogTitle>
            <DialogDescription>{t('leaveNote')}</DialogDescription>
          </DialogHeader>
          {detail.isError ? <p role='status'>{t('connectionError')}</p> : null}
          {selected ? (
            <>
              <div className='grid grid-cols-2 gap-3'>
                <PreviewImage
                  src={selected.result?.imageUrl ?? selected.productImageUrl}
                  alt={selected.displayName}
                  sizes='240px'
                  className='aspect-square rounded-xl'
                />
                <PreviewImage
                  src={selected.mockupImageUrl}
                  alt={t('mockup')}
                  sizes='240px'
                  className='aspect-square rounded-xl'
                />
              </div>
              <p aria-live='polite' role='status'>
                {label(selected)}
              </p>
              <p className='text-sm text-muted-foreground'>{formatDate(selected.createdAt, 'dateTimeShort')}</p>
              {selected.status === 'Failed' ? <p className='text-sm'>{t('failedNote')}</p> : null}
              {selected.result ? (
                <Button asChild>
                  <Link href={`/products/${selected.productId}/studio/${selected.result.sessionId}`}>
                    {t('openResult')}
                  </Link>
                </Button>
              ) : null}
              {isActiveJob(selected) ? (
                <Button
                  type='button'
                  variant='outline'
                  disabled={cancel.isPending || selected.cancelRequested}
                  onClick={() => {
                    if (window.confirm(t('cancelConfirm'))) cancel.mutate(selected.jobId)
                  }}
                >
                  {t('cancel')}
                </Button>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
