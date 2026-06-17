import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import {
  Award05Icon,
  Bookmark02Icon,
  FavouriteIcon,
  Flower2Icon,
  JobShareIcon,
  Location01Icon,
  Money03Icon,
  SentIcon,
  Tick02Icon,
  User02Icon,
  WorkIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ReactNode } from 'react'

import FloatingPetals from '@/app/[locale]/(public)/_components/floating-petals'
import type { Job } from '../types'

type JobDetailProps = {
  job: Job
}

const quickInfo = (job: Job, t: TranslationFunction) => [
  { label: t('recruitment.jobDetail.quickInfo.experience'), value: job.experience, icon: Award05Icon },
  { label: t('recruitment.jobDetail.quickInfo.level'), value: job.level, icon: User02Icon },
  { label: t('recruitment.jobDetail.quickInfo.employmentType'), value: job.employmentType, icon: WorkIcon },
  { label: t('recruitment.jobDetail.quickInfo.salary'), value: job.salary, icon: Money03Icon }
]

export default function JobDetail({ job }: JobDetailProps) {
  const { t } = useTranslation()

  return (
    <Card className='w-full gap-0 overflow-hidden border border-primary/10 bg-card py-0 shadow-sm shadow-primary/5 xl:sticky xl:top-6'>
      <div className='relative min-h-52 overflow-hidden bg-secondary/25'>
        <div
          className='absolute inset-0 z-0 bg-cover bg-center opacity-85'
          style={{ backgroundImage: `url(${job.image})` }}
          aria-hidden='true'
        />
        <div
          className='absolute inset-0 z-10 bg-gradient-to-t from-card via-card/10 to-transparent'
          aria-hidden='true'
        />
        <div className='pointer-events-none absolute inset-0 z-20 overflow-hidden' aria-hidden='true'>
          <FloatingPetals />
        </div>
        <div className='absolute right-5 top-5 z-40 flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='icon-lg'
            className='transform-gpu border-primary/10 bg-background/90 text-primary shadow-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/10 hover:text-primary active:translate-y-0 active:scale-95'
            aria-label={t('recruitment.jobDetail.actions.save')}
          >
            <HugeiconsIcon icon={Bookmark02Icon} strokeWidth={1.8} className='size-4' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon-lg'
            className='transform-gpu border-primary/10 bg-background/90 text-primary shadow-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/10 hover:text-primary active:translate-y-0 active:scale-95'
            aria-label={t('recruitment.jobDetail.actions.share')}
          >
            <HugeiconsIcon icon={JobShareIcon} strokeWidth={1.8} className='size-4' />
          </Button>
        </div>
      </div>

      <CardHeader className='relative z-30 -mt-12 gap-5 px-5 pb-0 sm:px-7'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex items-end gap-4'>
            <Avatar className='relative z-40 size-24 rounded-3xl border-4 border-card bg-primary text-primary-foreground shadow-lg shadow-primary/15 after:rounded-3xl after:border-primary/10'>
              <AvatarFallback className='relative rounded-3xl bg-transparent text-current'>
                <span className='font-title text-4xl'>{job.logoText}</span>
                <HugeiconsIcon icon={Flower2Icon} strokeWidth={1.5} className='absolute size-11 opacity-30' />
              </AvatarFallback>
            </Avatar>
            <div className='relative z-40 pb-1'>
              <h1 className='text-2xl font-semibold leading-tight text-foreground sm:text-3xl'>{job.title}</h1>
              <p className='mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
                <span>{job.company}</span>
                <span aria-hidden='true'>·</span>
                <span className='inline-flex items-center gap-1'>
                  <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className='size-4' />
                  {job.location}
                </span>
              </p>
            </div>
          </div>

          <div className='relative z-40 text-left text-sm text-muted-foreground sm:text-right'>
            <p>{t('recruitment.jobDetail.posted', { time: job.postedAt })}</p>
            <p className='mt-1'>{job.views}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='px-5 pt-5 sm:px-7'>
        <div className='grid gap-2 rounded-3xl border border-border bg-background p-3 sm:grid-cols-2 2xl:grid-cols-4'>
          {quickInfo(job, t).map((item) => (
            <Badge
              key={item.label}
              variant='secondary'
              className='h-auto w-full justify-start gap-3 rounded-2xl bg-secondary/20 px-3 py-3 text-left whitespace-normal transition-colors delay-75 duration-500 ease-out hover:bg-secondary/30'
            >
              <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary'>
                <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className='size-4' />
              </span>
              <span>
                <p className='text-xs text-muted-foreground'>{item.label}</p>
                <p className='mt-0.5 text-sm font-semibold text-primary'>{item.value}</p>
              </span>
            </Badge>
          ))}
        </div>

        <div className='mt-6 text-sm leading-7 text-foreground'>
          <DetailSection title={t('recruitment.jobDetail.sections.overview')}>
            <p className='text-muted-foreground'>{job.summary}</p>
          </DetailSection>

          <DecorativeSeparator className='my-6' />
          <DetailSection title={t('recruitment.jobDetail.sections.responsibilities')} items={job.responsibilities} />
          <DecorativeSeparator className='my-6' />
          <DetailSection title={t('recruitment.jobDetail.sections.requirements')} items={job.requirements} />
          <DecorativeSeparator className='my-6' />
          <DetailSection title={t('recruitment.jobDetail.sections.benefits')} items={job.benefits} />
        </div>
      </CardContent>

      <CardFooter className='grid gap-3 px-5 pb-5 pt-7 sm:grid-cols-[1fr_auto] sm:px-7 sm:pb-7'>
        <Button
          type='button'
          size='lg'
          className='h-12 transform-gpu px-8 transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
        >
          <HugeiconsIcon icon={SentIcon} strokeWidth={1.8} className='size-4' />
          {t('recruitment.jobDetail.actions.apply')}
        </Button>
        <Button
          type='button'
          variant='outline'
          size='lg'
          className='h-12 transform-gpu border-primary/25 bg-background px-8 text-primary transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary active:translate-y-0 active:scale-[0.98]'
        >
          <HugeiconsIcon icon={Bookmark02Icon} strokeWidth={1.8} className='size-4' />
          {t('recruitment.jobDetail.actions.save')}
        </Button>
      </CardFooter>
    </Card>
  )
}

function DecorativeSeparator({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Separator className='bg-primary/10' />
      <span className='absolute left-1/2 top-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/10 bg-card text-primary shadow-sm'>
        <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
      </span>
    </div>
  )
}

function DetailSection({ title, children, items }: { title: string; children?: ReactNode; items?: string[] }) {
  return (
    <section>
      <h2 className='mb-2 font-semibold text-primary'>{title}</h2>
      {children}
      {items ? (
        <ul className='space-y-1.5 text-muted-foreground'>
          {items.map((item) => (
            <li key={item} className='flex gap-2'>
              <span className='mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary'>
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className='size-3' aria-hidden='true' />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
