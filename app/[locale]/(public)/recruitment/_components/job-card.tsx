import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Flower2Icon, Location01Icon, Money03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { KeyboardEvent } from 'react'

import { formatJobSalary, getJobAvatarFallback, getJobEmploymentTypeLabel } from '../helpers'
import type { Job } from '../types'

type JobCardProps = {
  job: Job
  isSelected: boolean
  onClick: () => void
}

export default function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const { t } = useTranslation()
  const salary = formatJobSalary(job)
  const avatarFallback = getJobAvatarFallback(job.title)
  const employmentTypeLabel = getJobEmploymentTypeLabel(job.employmentType, t)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <article
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className='w-full rounded-4xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25'
      aria-pressed={isSelected}
      aria-label={t('recruitment.jobCard.viewDetails', { title: job.title })}
    >
      <Card
        className={cn(
          'group w-full transform-gpu gap-0 border py-0 text-left shadow-md shadow-primary/10 ring-1 ring-primary/10 transition-all delay-100 duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/15 active:translate-y-0 active:scale-[0.99]',
          isSelected
            ? 'border-primary/45 bg-gradient-to-br from-primary/10 via-card to-secondary/35 ring-primary/25 shadow-primary/20'
            : 'border-primary/15 bg-gradient-to-br from-card via-card to-secondary/20'
        )}
      >
        <CardContent className='flex items-start gap-4 p-4'>
          <Avatar
            className={cn(
              'size-10 border text-primary after:border-primary/10',
              isSelected ? 'border-primary/30 bg-primary text-primary-foreground' : 'border-primary/10 bg-secondary/20'
            )}
          >
            {job.avatarUrl ? <AvatarImage src={job.avatarUrl} alt={job.title} /> : null}
            <AvatarFallback className='relative bg-transparent text-current'>
              <span className='font-title text-xl'>{avatarFallback}</span>
              <HugeiconsIcon icon={Flower2Icon} strokeWidth={1.5} className='absolute size-7 opacity-30' />
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <h3 className='truncate text-base font-semibold text-foreground'>{job.title}</h3>
                <p className='mt-1 flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <Badge variant='secondary' className='h-5 bg-primary/10 px-2.5 text-primary'>
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className='size-4' />
                    {job.location}
                  </Badge>
                  <Badge variant='secondary' className='h-5 bg-primary/10 px-2.5 text-primary'>
                    {employmentTypeLabel}
                  </Badge>
                </p>
              </div>
            </div>

            <div className='mt-1 flex flex-wrap items-center gap-2'>
              {salary ? (
                <Badge variant='secondary' className='h-5 bg-secondary/30 px-2.5 text-muted-foreground'>
                  <HugeiconsIcon icon={Money03Icon} strokeWidth={1.8} className='size-3' />
                  {salary}
                </Badge>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  )
}
