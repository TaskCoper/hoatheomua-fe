import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import type { Job } from '../types'
import JobCard from './job-card'

type JobListProps = {
  jobs: Job[]
  selectedJobId: string
  onSelectJob: (jobId: string) => void
  isLoading: boolean
  isError: boolean
  pageIndex: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
}

const getVisiblePages = (pageIndex: number, pageCount: number) => {
  const pages = Array.from(new Set([1, pageIndex - 1, pageIndex, pageIndex + 1, pageCount]))
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b)

  return pages.reduce<Array<number | 'ellipsis'>>((acc, page, index) => {
    const previousPage = pages[index - 1]

    if (previousPage && page - previousPage > 1) {
      acc.push('ellipsis')
    }

    acc.push(page)
    return acc
  }, [])
}

function JobListSkeleton() {
  return (
    <div className='w-full space-y-4'>
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className='w-full gap-0 border border-primary/15 bg-card py-0 shadow-md shadow-primary/10'>
          <CardContent className='flex items-start gap-4 p-4'>
            <Skeleton className='size-16 rounded-3xl' />
            <div className='min-w-0 flex-1 space-y-4'>
              <div className='space-y-2'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-24 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function JobList({
  jobs,
  selectedJobId,
  onSelectJob,
  isLoading,
  isError,
  pageIndex,
  pageSize,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onPageChange
}: JobListProps) {
  const { t } = useTranslation()
  const pageCount = Math.ceil(totalCount / pageSize)
  const visiblePages = getVisiblePages(pageIndex, pageCount)

  if (isLoading && jobs.length === 0) {
    return (
      <section className='w-full min-w-0 space-y-4'>
        <JobListSkeleton />
      </section>
    )
  }

  if (isError) {
    return (
      <section className='w-full min-w-0 space-y-4'>
        <Card className='border border-primary/10 bg-card text-center shadow-sm shadow-primary/5'>
          <CardContent className='p-8 text-sm text-muted-foreground'>{t('error.somethingWentWrong')}</CardContent>
        </Card>
      </section>
    )
  }

  if (!isLoading && jobs.length === 0) {
    return (
      <section className='w-full min-w-0 space-y-4'>
        <Card className='border border-primary/10 bg-card text-center shadow-sm shadow-primary/5'>
          <CardContent className='p-8 text-sm text-muted-foreground'>{t('dataTable.table.noResults')}</CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className='w-full min-w-0 space-y-4'>
      <div className='w-full space-y-4'>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isSelected={job.id === selectedJobId} onClick={() => onSelectJob(job.id)} />
        ))}
      </div>

      {pageCount > 1 ? (
        <div className='flex items-center justify-center gap-2 pt-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            disabled={!hasPreviousPage || isLoading}
            onClick={() => onPageChange(pageIndex - 1)}
            className='transform-gpu transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-primary/5 hover:text-primary active:translate-y-0 active:scale-[0.98]'
            aria-label={t('recruitment.pagination.previous')}
          >
            <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={1.8} className='size-4' />
          </Button>
          {visiblePages.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className='px-2 text-sm text-muted-foreground'>
                ...
              </span>
            ) : (
              <Button
                type='button'
                key={page}
                variant={page === pageIndex ? 'default' : 'outline'}
                size='icon-sm'
                disabled={isLoading}
                onClick={() => onPageChange(page)}
                className={
                  page === pageIndex
                    ? 'transform-gpu transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                    : 'transform-gpu border-border/70 bg-card transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:text-primary active:translate-y-0 active:scale-[0.98]'
                }
                aria-label={t('recruitment.pagination.page', { page })}
                aria-current={page === pageIndex ? 'page' : undefined}
              >
                {page}
              </Button>
            )
          )}
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            disabled={!hasNextPage || isLoading}
            onClick={() => onPageChange(pageIndex + 1)}
            className='transform-gpu transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-primary/5 hover:text-primary active:translate-y-0 active:scale-[0.98]'
            aria-label={t('recruitment.pagination.next')}
          >
            <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={1.8} className='size-4' />
          </Button>
        </div>
      ) : null}
    </section>
  )
}
