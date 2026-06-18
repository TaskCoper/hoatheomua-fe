import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { Bookmark02Icon, Flower2Icon, Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { KeyboardEvent, MouseEvent } from 'react'

import type { Job } from '../types'

type JobCardProps = {
  job: Job
  isSelected: boolean
  onClick: () => void
}

export default function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const { t } = useTranslation()

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
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
              'size-16 border text-primary after:border-primary/10',
              isSelected ? 'border-primary/30 bg-primary text-primary-foreground' : 'border-primary/10 bg-secondary/20'
            )}
          >
            <AvatarFallback className='relative bg-transparent text-current'>
              <span className='font-title text-xl'>{job.logoText}</span>
              <HugeiconsIcon icon={Flower2Icon} strokeWidth={1.5} className='absolute size-7 opacity-30' />
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <h3 className='truncate text-base font-semibold text-foreground'>{job.title}</h3>
                <p className='mt-1 flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className='size-4' />
                  {job.location}
                </p>
              </div>

              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={handleSave}
                className={cn(
                  'shrink-0 transform-gpu border transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary active:translate-y-0 active:scale-[0.98]',
                  isSelected
                    ? 'border-primary/15 bg-primary/10 text-primary'
                    : 'border-border/80 bg-background text-muted-foreground group-hover:text-primary'
                )}
                aria-label={t('recruitment.jobCard.save', { title: job.title })}
              >
                <HugeiconsIcon icon={Bookmark02Icon} strokeWidth={1.8} className='size-4' />
              </Button>
            </div>

            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <Badge variant='secondary' className='h-6 bg-primary/10 px-2.5 text-primary'>
                {job.employmentType}
              </Badge>
              <Badge variant='secondary' className='h-6 bg-secondary/30 px-2.5 text-muted-foreground'>
                {job.level}
              </Badge>
              {job.isNew ? (
                <Badge variant='outline' className='h-6 border-leaf/25 bg-leaf/10 px-2.5 text-leaf'>
                  {t('recruitment.jobCard.new')}
                </Badge>
              ) : null}
              <span className='ml-auto text-xs text-muted-foreground'>{job.postedAt}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  )
}
