import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import type { Job } from '../types'
import JobCard from './job-card'

type JobListProps = {
  jobs: Job[]
  selectedJobId: string
  onSelectJob: (jobId: string) => void
}

export default function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  return (
    <section className='w-full min-w-0 space-y-4'>
      <div className='w-full space-y-4'>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isSelected={job.id === selectedJobId} onClick={() => onSelectJob(job.id)} />
        ))}
      </div>

      <div className='flex items-center justify-center gap-2 pt-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          className='transform-gpu transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-primary/5 hover:text-primary active:translate-y-0 active:scale-[0.98]'
          aria-label='Trang trước'
        >
          <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={1.8} className='size-4' />
        </Button>
        {[1, 2, 3].map((page) => (
          <Button
            type='button'
            key={page}
            variant={page === 1 ? 'default' : 'outline'}
            size='icon-sm'
            className={
              page === 1
                ? 'transform-gpu transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                : 'transform-gpu border-border/70 bg-card transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:text-primary active:translate-y-0 active:scale-[0.98]'
            }
            aria-label={`Trang ${page}`}
            aria-current={page === 1 ? 'page' : undefined}
          >
            {page}
          </Button>
        ))}
        <span className='px-2 text-sm text-muted-foreground'>...</span>
        <Button
          type='button'
          variant='outline'
          size='icon-sm'
          className='transform-gpu border-border/70 bg-card transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:text-primary active:translate-y-0 active:scale-[0.98]'
          aria-label='Trang 5'
        >
          5
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          className='transform-gpu transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-primary/5 hover:text-primary active:translate-y-0 active:scale-[0.98]'
          aria-label='Trang sau'
        >
          <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={1.8} className='size-4' />
        </Button>
      </div>
    </section>
  )
}
