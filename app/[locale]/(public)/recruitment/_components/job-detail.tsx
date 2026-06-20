import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Flower2Icon, Location01Icon, Money03Icon, SentIcon, User02Icon, WorkIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import FloatingPetals from '../../_components/floating-petals'
import { formatJobSalary, getJobAvatarFallback, getJobEmploymentTypeLabel } from '../helpers'
import type { Job } from '../types'
import ApplyJobDialog from './apply-job-dialog'

type JobDetailProps = {
  job: Job
}

export default function JobDetail({ job }: JobDetailProps) {
  const { t } = useTranslation()
  const salary = formatJobSalary(job)
  const avatarFallback = getJobAvatarFallback(job.title)
  const employmentTypeLabel = getJobEmploymentTypeLabel(job.employmentType, t)
  const description = job.description?.trim()

  const quickInfo = [
    {
      label: t('recruitment.jobDetail.quickInfo.employmentType'),
      value: employmentTypeLabel,
      icon: WorkIcon
    },
    {
      label: t('recruitment.jobDetail.quickInfo.openings'),
      value: t('recruitment.jobDetail.quickInfo.openingsValue', { count: job.openings }),
      icon: User02Icon
    },
    {
      label: t('recruitment.jobDetail.quickInfo.salary'),
      value: salary,
      icon: Money03Icon
    },
    {
      label: t('recruitment.jobDetail.quickInfo.location'),
      value: job.location,
      icon: Location01Icon
    }
  ].filter((item) => item.value)

  return (
    <Card className='w-full gap-0 overflow-hidden border border-primary/10 bg-card py-0 shadow-sm shadow-primary/5 xl:sticky xl:top-6'>
      <JobCoverBanner coverImageUrl={job.coverImageUrl} title={job.title} />

      <CardHeader className='relative gap-0 bg-gradient-to-br from-card via-card to-secondary/15 px-5 pb-6 pt-0 sm:px-7'>
        <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex min-w-0 items-end gap-4'>
            <Avatar className='-mt-12 size-24 shrink-0 rounded-3xl border-4 border-card bg-primary text-primary-foreground shadow-lg shadow-primary/15 after:rounded-3xl after:border-primary/10 sm:-mt-14 sm:size-28'>
              {job.avatarUrl ? <AvatarImage src={job.avatarUrl} alt={job.title} className='rounded-3xl' /> : null}
              <AvatarFallback className='relative rounded-3xl bg-transparent text-current'>
                <span className='font-title text-4xl'>{avatarFallback}</span>
                <HugeiconsIcon icon={Flower2Icon} strokeWidth={1.5} className='absolute size-11 opacity-30' />
              </AvatarFallback>
            </Avatar>

            <div className='min-w-0 pb-1 text-left'>
              <h1 className='text-2xl font-semibold leading-tight text-foreground sm:text-3xl'>{job.title}</h1>
              <p className='mt-2 flex items-center gap-1.5 text-sm text-muted-foreground'>
                <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className='size-4 shrink-0' />
                <span className='truncate'>{job.location}</span>
              </p>
            </div>
          </div>

          <div className='flex flex-wrap gap-2 sm:justify-end sm:pb-1'>
            <Badge variant='secondary' className='bg-primary/10 px-2.5 text-primary'>
              {employmentTypeLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='px-5 pt-5 sm:px-7'>
        <FloatingPetals />
        <div className='grid gap-2 rounded-3xl border border-border bg-background p-3 sm:grid-cols-2 2xl:grid-cols-4'>
          {quickInfo.map((item) => (
            <Badge
              key={item.label}
              variant='secondary'
              className='h-auto w-full justify-start gap-3 rounded-2xl bg-secondary/20 px-3 py-3 text-left whitespace-normal transition-colors delay-75 duration-500 ease-out hover:bg-secondary/30'
            >
              <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary'>
                <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className='size-4' />
              </span>
              <span className='min-w-0'>
                <p className='text-xs text-muted-foreground'>{item.label}</p>
                <p className='mt-0.5 truncate text-sm font-semibold text-primary'>{item.value}</p>
              </span>
            </Badge>
          ))}
        </div>

        {description ? (
          <section className='mt-5 rounded-3xl border border-primary/10 bg-background px-4 py-5 sm:px-5'>
            <h2 className='mb-4 text-base font-semibold text-primary'>
              {t('recruitment.jobDetail.sections.responsibilities')}
            </h2>
            <SanitizedHtml
              html={description}
              className='max-h-96 text-sm leading-7 text-foreground prose-headings:text-primary prose-a:text-primary prose-img:rounded-2xl prose-img:border prose-img:border-primary/10 prose-img:shadow-sm sm:text-sm'
            />
          </section>
        ) : null}
      </CardContent>

      <CardFooter className='grid gap-3 px-5 pb-5 pt-7 sm:grid-cols-[1fr_auto] sm:px-7 sm:pb-7'>
        <ApplyJobDialog job={job}>
          <Button
            type='button'
            size='lg'
            className='h-12 transform-gpu px-8 transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
          >
            <HugeiconsIcon icon={SentIcon} strokeWidth={1.8} className='size-4' />
            {t('recruitment.jobDetail.actions.apply')}
          </Button>
        </ApplyJobDialog>
      </CardFooter>
    </Card>
  )
}

function JobCoverBanner({ coverImageUrl, title }: { coverImageUrl: string; title: string }) {
  const [failedCoverImageUrl, setFailedCoverImageUrl] = useState<string | null>(null)
  const shouldRenderImage = Boolean(coverImageUrl) && failedCoverImageUrl !== coverImageUrl

  return (
    <div className='relative h-44 w-full overflow-hidden bg-gradient-to-r from-primary/15 to-primary/5 sm:h-52 lg:h-56'>
      {shouldRenderImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt={title}
          className='absolute inset-0 size-full object-cover'
          onError={() => setFailedCoverImageUrl(coverImageUrl)}
        />
      ) : null}
      <div
        className='absolute inset-x-0 bottom-0 h-[90%] bg-gradient-to-b from-transparent from-0% via-card/15 via-55% to-card/99 to-100%'
        aria-hidden='true'
      />
      {/* <div
        className='absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-card/25 backdrop-blur-[1px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_70%,black_100%)]'
        aria-hidden='true'
      /> */}
      {/* <div className='absolute inset-x-0 -bottom-3 h-8 bg-card/25 blur-md' aria-hidden='true' /> */}
    </div>
  )
}
