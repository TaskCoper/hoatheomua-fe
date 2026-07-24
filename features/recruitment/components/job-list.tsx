import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { useTranslation } from '@/lib/i18n/dictionary-provider'

import type { Job } from '../types'
import JobCard from '@/features/recruitment/components/job-card'

type JobListProps = {
  jobs: Job[]
  selectedJobId: string
  onSelectJob: (jobId: string) => void
  isLoading: boolean
  pageIndex: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
}

const buildPageList = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= 1) return [1]
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: Array<number | 'ellipsis'> = [1]
  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

export default function JobList({
  jobs,
  selectedJobId,
  onSelectJob,
  isLoading,
  pageIndex,
  pageSize,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onPageChange
}: JobListProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pageList = buildPageList(pageIndex, totalPages)

  const goTo = (next: number) => {
    if (isLoading || next === pageIndex || next < 1 || next > totalPages) return
    onPageChange(next)
  }

  const handlePrevious = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasPreviousPage) return
    goTo(pageIndex - 1)
  }

  const handleNext = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!hasNextPage) return
    goTo(pageIndex + 1)
  }

  const handlePageClick = (page: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    goTo(page)
  }

  return (
    <section className='w-full min-w-0 space-y-4'>
      <div className='w-full space-y-2'>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isSelected={job.id === selectedJobId} onClick={() => onSelectJob(job.id)} />
        ))}
      </div>

      <Pagination className='pt-2'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#'
              text={t('recruitment.pagination.previous')}
              aria-disabled={!hasPreviousPage || isLoading}
              className={!hasPreviousPage || isLoading ? 'pointer-events-none opacity-50' : undefined}
              onClick={handlePrevious}
            />
          </PaginationItem>

          {pageList.map((entry, index) =>
            entry === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <PaginationLink
                  href='#'
                  isActive={entry === pageIndex}
                  aria-disabled={isLoading}
                  aria-label={t('recruitment.pagination.page', { page: entry })}
                  className={
                    isLoading && entry !== pageIndex
                      ? 'pointer-events-none opacity-50'
                      : entry === pageIndex
                        ? 'pointer-events-none bg-primary text-primary-foreground'
                        : undefined
                  }
                  onClick={handlePageClick(entry)}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href='#'
              text={t('recruitment.pagination.next')}
              aria-disabled={!hasNextPage || isLoading}
              className={!hasNextPage || isLoading ? 'pointer-events-none opacity-50' : undefined}
              onClick={handleNext}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </section>
  )
}
