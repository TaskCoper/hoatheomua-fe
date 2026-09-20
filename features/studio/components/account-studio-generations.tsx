'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import StudioGenerationDialog from '@/features/studio/components/studio-generation-dialog'
import { useGetInfiniteGeneratedFlowers } from '@/features/studio/hooks/use-get-generated-flowers'
import { toStudioGenerationSessions } from '@/features/studio/studio-mappers'
import type { StudioGenerationSession } from '@/features/studio/types'
import { AccountEmptyNote, AccountEmptyState, AccountFilterTabs } from '@/features/users/components/account-panel'
import { AccountSectionHeader } from '@/features/users/components/account-shell'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import PreviewImage from '@/shared/components/preview-image'
import { cn } from '@/shared/utils'
import {
  AiMagicIcon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Layers01Icon,
  SparklesIcon,
  ViewIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

const ALL = 'all'

const tileStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } }
}

const tileItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 20 } }
}

const tileClass =
  'group relative block w-full overflow-hidden rounded-3xl bg-card text-left shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export default function AccountStudioGenerations() {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const {
    sessions,
    totalCount,
    isGettingGeneratedFlowers,
    isGeneratedFlowersError,
    isGettingMoreGeneratedFlowers,
    hasMoreGeneratedFlowers,
    loadMoreGeneratedFlowers
  } = useGetInfiniteGeneratedFlowers()

  const generations = useMemo(() => toStudioGenerationSessions(sessions), [sessions])

  const [scene, setScene] = useState<string>(ALL)
  // The session outlives the close so the exit animation keeps its content instead of
  // flashing the loading state on the way out.
  const [detailSession, setDetailSession] = useState<StudioGenerationSession | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const options = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()

    generations.forEach((generation) => {
      const entry = counts.get(generation.mockupId)
      counts.set(generation.mockupId, {
        label: generation.mockupName,
        count: (entry?.count ?? 0) + 1
      })
    })

    return [
      { value: ALL, label: t('studio.generations.filterAll'), count: generations.length },
      ...Array.from(counts, ([value, entry]) => ({ value, label: entry.label, count: entry.count }))
    ]
  }, [generations, t])

  const visible = scene === ALL ? generations : generations.filter((item) => item.mockupId === scene)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const canLoadMore = hasMoreGeneratedFlowers && !isGettingMoreGeneratedFlowers

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !canLoadMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreGeneratedFlowers()
      },
      { rootMargin: '320px 0px' }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [canLoadMore, loadMoreGeneratedFlowers])

  return (
    <>
      <AccountSectionHeader
        title={t('studio.generations.title')}
        description={
          isGettingGeneratedFlowers
            ? t('studio.generations.loading')
            : t('studio.generations.count', { count: totalCount })
        }
      />

      {isGettingGeneratedFlowers ? (
        <GenerationsLoading />
      ) : isGeneratedFlowersError ? (
        <AccountEmptyNote icon={AiMagicIcon}>{t('studio.generations.error')}</AccountEmptyNote>
      ) : generations.length === 0 ? (
        <AccountEmptyState
          icon={AiMagicIcon}
          title={t('studio.generations.empty.title')}
          description={t('studio.generations.empty.description')}
          action={
            <Button asChild size='lg' className='mt-2'>
              <Link href='/products'>
                <HugeiconsIcon icon={SparklesIcon} className='size-4' />
                {t('studio.generations.empty.cta')}
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <AccountFilterTabs
            value={scene}
            options={options}
            onChange={setScene}
            ariaLabel={t('studio.generations.filterLabel')}
          />

          {visible.length === 0 ? (
            <AccountEmptyNote icon={AiMagicIcon}>{t('studio.generations.emptyFilter')}</AccountEmptyNote>
          ) : (
            <motion.ul
              key={scene}
              initial='hidden'
              animate='visible'
              variants={tileStagger}
              className='grid grid-cols-2 gap-3 sm:grid-cols-3'
            >
              {visible.map((generation) => (
                <motion.li key={generation.sessionId} variants={tileItem}>
                  <GenerationTile
                    generation={generation}
                    dateLabel={formatDate(generation.createdAt, 'dateMedium')}
                    onOpen={() => {
                      setDetailSession(generation)
                      setDetailOpen(true)
                    }}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}

          <div ref={sentinelRef}>
            {isGettingMoreGeneratedFlowers ? (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className='aspect-4/5 rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
                  />
                ))}
              </div>
            ) : hasMoreGeneratedFlowers ? (
              <div className='flex justify-center pt-1'>
                <Button variant='outline' onClick={() => loadMoreGeneratedFlowers()}>
                  {t('studio.generations.loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}

      <StudioGenerationDialog session={detailSession} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  )
}

function GenerationTile({
  generation,
  dateLabel,
  onOpen
}: {
  generation: StudioGenerationSession
  dateLabel: string
  onOpen: () => void
}) {
  const { t } = useTranslation()

  const body = (
    <>
      <PreviewImage
        src={generation.imageUrl}
        alt={t('studio.generations.previewAlt', { name: generation.name, scene: generation.mockupName })}
        sizes='(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw'
        className='aspect-4/5 w-full'
      />

      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-primary/85 via-primary/35 to-transparent'
      />

      <span className='absolute left-2.5 top-2.5 inline-flex max-w-[calc(100%-4.5rem)] items-center gap-1 rounded-full bg-white/75 px-2 py-1 text-[0.625rem] font-semibold text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md'>
        <HugeiconsIcon icon={SparklesIcon} className='size-3 shrink-0' />
        <span className='truncate'>{generation.mockupName}</span>
      </span>

      <span
        className={cn(
          'absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.625rem] font-semibold shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md',
          generation.isFinished ? 'bg-white/75 text-primary' : 'bg-primary/80 text-primary-foreground'
        )}
      >
        <HugeiconsIcon
          icon={generation.isFinished ? CheckmarkCircle02Icon : Layers01Icon}
          className='size-3 shrink-0'
        />
        <span className='tabular-nums'>{generation.versionCount}</span>
      </span>

      <span className='absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white'>
        <span className='min-w-0'>
          <span className='block truncate font-title text-sm font-bold leading-tight sm:text-base'>
            {generation.name}
          </span>
          <span className='mt-0.5 block truncate text-[0.6875rem] text-white/75'>
            <span className='tabular-nums'>{dateLabel}</span>
            {' · '}
            {generation.isFinished ? t('studio.generations.finished') : t('studio.generations.draft')}
          </span>
        </span>

        <span
          aria-hidden='true'
          className='grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors duration-300 group-hover:bg-white group-hover:text-primary'
        >
          <HugeiconsIcon
            icon={generation.isFinished ? ViewIcon : ArrowRight02Icon}
            className='size-3.5 transition-transform duration-300 group-hover:translate-x-0.5'
          />
        </span>
      </span>
    </>
  )

  return generation.isFinished ? (
    <button
      type='button'
      onClick={onOpen}
      aria-label={t('studio.generations.openDetail', { name: generation.name })}
      className={tileClass}
    >
      {body}
    </button>
  ) : (
    <Link
      href={`/products/${generation.productId}/studio/${generation.sessionId}`}
      aria-label={t('studio.generations.openInStudio', { name: generation.name })}
      className={tileClass}
    >
      {body}
    </Link>
  )
}

function GenerationsLoading() {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          key={index}
          className='aspect-4/5 rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
        />
      ))}
    </div>
  )
}
