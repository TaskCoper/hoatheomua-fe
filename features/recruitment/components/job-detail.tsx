'use client'

import RichTextBody from '@/components/rich-text-body'
import { AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ApplyJobDialog from '@/features/recruitment/components/apply-job-dialog'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { sanitizeRichText } from '@/lib/sanitize'
import ViewportAvatar from '@/shared/components/viewport-avatar'
import { useImageFrame } from '@/shared/components/viewport-image'
import { cn } from '@/shared/utils'
import {
  ArrowDown01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  Flower2Icon,
  Location01Icon,
  LoginCircle01Icon,
  MailValidation01Icon,
  Money03Icon,
  SentIcon,
  User02Icon,
  WorkIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { formatJobSalary, getJobAvatarFallback, getJobEmploymentTypeLabel } from '../helpers'
import type { Job } from '../types'

type JobDetailProps = {
  job: Job
  /**
   * When set, a "view full page" button is shown next to the apply CTA linking to
   * the job's own SEO page. Passed only from the list's master-detail view - the
   * standalone `/recruitment/[slug]` page omits it (you're already there).
   */
  detailHref?: string
}

export default function JobDetail({ job, detailHref }: JobDetailProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const salary = formatJobSalary(job)
  const avatarFallback = getJobAvatarFallback(job.title)
  const employmentTypeLabel = getJobEmploymentTypeLabel(job.employmentType, t)
  const description = job.description?.trim()

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showDescriptionToggle, setShowDescriptionToggle] = useState(false)
  const [descriptionElement, setDescriptionElement] = useState<HTMLDivElement | null>(null)

  const { me, isAuthenticated, isVerificationRequired, isGettingMe } = useGetMe()

  // The apply CTA depends on `me`, which SSR doesn't have but the client's
  // persisted React Query cache does. Because this card renders inside the
  // recruitment page's Suspense fallback on the server, that difference would
  // hydrate a real button over a server-rendered skeleton. Gate the CTA on mount
  // so the server and first client render both show the neutral skeleton.
  const isMounted = useHasMounted()

  useEffect(() => {
    if (!descriptionElement) return

    const checkHeight = () => {
      setShowDescriptionToggle(descriptionElement.scrollHeight > 384)
    }

    checkHeight()

    const observer = new ResizeObserver(checkHeight)
    observer.observe(descriptionElement)
    return () => observer.disconnect()
  }, [descriptionElement, description])

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
    <Card className='w-full gap-0 p-0 overflow-hidden border border-primary/10 bg-card shadow-sm shadow-primary/5'>
      <JobCoverBanner coverImageUrl={job.coverImageUrl} title={job.title} />
      <CardHeader className='relative gap-0 bg-gradient-to-br from-card via-card to-secondary/15 px-4 pb-6 pt-0 sm:px-7'>
        <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex min-w-0 items-end gap-3 sm:gap-4'>
            <ViewportAvatar
              src={job.avatarUrl}
              alt={job.title}
              className='-mt-8 size-16 shrink-0 rounded-3xl border-4 border-card bg-primary text-primary-foreground shadow-lg shadow-primary/15 after:rounded-3xl after:border-primary/10 sm:-mt-14 sm:size-28'
              imageClassName='rounded-3xl'
            >
              <AvatarFallback className='relative rounded-3xl bg-transparent text-current'>
                <span className='font-title text-2xl sm:text-4xl'>{avatarFallback}</span>
                <HugeiconsIcon icon={Flower2Icon} strokeWidth={1.5} className='absolute size-7 opacity-30 sm:size-11' />
              </AvatarFallback>
            </ViewportAvatar>

            <div className='min-w-0 pb-1 text-left'>
              <h1 className='text-lg font-semibold leading-tight text-foreground sm:text-3xl'>{job.title}</h1>
              <p className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
                <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className='size-3.5 shrink-0 sm:size-4' />
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
      <CardContent className='p-2 space-y-2'>
        <div className='grid gap-2 rounded-3xl border border-border bg-background p-2 sm:grid-cols-2 2xl:grid-cols-4'>
          {quickInfo.map((item) => (
            <Badge
              key={item.label}
              variant='secondary'
              className='h-auto w-full justify-start gap-3 rounded-2xl bg-secondary/20 p-2 text-left whitespace-normal transition-colors delay-75 duration-500 ease-out hover:bg-secondary/30'
            >
              <span className='flex size-8 shrink-0 justify-center items-center rounded-full bg-primary/10 text-primary'>
                <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className='size-4' />
              </span>

              <span className='min-w-0'>
                <p className='text-[0.65rem] text-muted-foreground'>{item.label}</p>
                <p className='truncate text-xs font-semibold text-primary'>{item.value}</p>
              </span>
            </Badge>
          ))}
        </div>

        <div className='mb-2 flex flex-col gap-2 sm:flex-row'>
          <div className='flex-1'>
            {!isMounted || isGettingMe ? (
              <Skeleton className='h-10 w-full rounded-4xl' />
            ) : isVerificationRequired ? (
              <Button asChild size='lg' className='w-full'>
                <Link href={{ pathname: '/verify-sent', query: { email: me!.email } }}>
                  {t('auth.verifyEmail.title')}
                  <HugeiconsIcon icon={MailValidation01Icon} strokeWidth={1.8} className='size-4' />
                </Link>
              </Button>
            ) : isAuthenticated ? (
              <ApplyJobDialog job={job}>
                <Button
                  type='button'
                  size='lg'
                  className='transform-gpu w-full transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                >
                  <HugeiconsIcon icon={SentIcon} strokeWidth={1.8} className='size-4' />
                  {t('recruitment.jobDetail.actions.apply')}
                </Button>
              </ApplyJobDialog>
            ) : (
              <Button asChild size='lg' className='w-full'>
                <Link href={{ pathname: '/sign-in', query: { from: pathname } }}>
                  {t('auth.signIn.title')}
                  <HugeiconsIcon icon={LoginCircle01Icon} strokeWidth={1.8} className='size-4' />
                </Link>
              </Button>
            )}
          </div>

          {detailHref ? (
            <Button asChild variant='outline' size='lg' className='w-full sm:w-auto'>
              <Link href={detailHref}>
                {t('recruitment.jobDetail.actions.viewFullPage')}
                <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={1.8} className='size-4' />
              </Link>
            </Button>
          ) : null}
        </div>

        {description ? (
          <section className='rounded-3xl border border-primary/10 bg-background p-4'>
            {/* <h2 className='mb-4 text-sm font-semibold text-primary'>
              {t('recruitment.jobDetail.sections.responsibilities')}
            </h2> */}
            <div className='relative'>
              <div
                ref={setDescriptionElement}
                className={cn(
                  'overflow-hidden transition-[max-height] duration-300',
                  !isDescriptionExpanded && showDescriptionToggle && 'max-h-96'
                )}
              >
                {/* Client component: the job arrives from a client query, so it
                    sanitises here rather than through the server `SanitizedHtml`. */}
                <RichTextBody html={sanitizeRichText(description)} />
              </div>

              {showDescriptionToggle && !isDescriptionExpanded ? (
                <div className='pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent' />
              ) : null}
            </div>

            {showDescriptionToggle ? (
              <Button
                type='button'
                variant='outline'
                className='mt-3 w-full gap-2'
                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                aria-expanded={isDescriptionExpanded}
              >
                <HugeiconsIcon icon={isDescriptionExpanded ? ArrowUp01Icon : ArrowDown01Icon} className='size-4' />
                {isDescriptionExpanded
                  ? t('recruitment.jobDetail.actions.viewLess')
                  : t('recruitment.jobDetail.actions.viewMore')}
              </Button>
            ) : null}
          </section>
        ) : null}
      </CardContent>
    </Card>
  )
}

function JobCoverBanner({ coverImageUrl, title }: { coverImageUrl: string; title: string }) {
  const [failedCoverImageUrl, setFailedCoverImageUrl] = useState<string | null>(null)
  const { attachBox, attachImage, src, framed, style, onLoad } = useImageFrame(coverImageUrl)
  const shouldRenderImage = Boolean(coverImageUrl) && failedCoverImageUrl !== coverImageUrl

  return (
    <div
      ref={attachBox}
      className='relative h-28 w-full overflow-hidden bg-gradient-to-r from-primary/15 to-primary/5 sm:h-52 lg:h-56'
    >
      {shouldRenderImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={attachImage}
          src={src}
          alt={title}
          // Inline width/height/left/top beat these classes; `inset-auto` just drops the unused edges.
          className={cn('absolute inset-0 size-full object-cover', framed && 'inset-auto max-w-none')}
          style={style}
          onLoad={onLoad}
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
