'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudioGenerations } from '@/features/studio/hooks/use-studio-generations'
import type { StudioGeneration } from '@/features/studio/types'
import { AccountEmptyNote, AccountEmptyState, AccountFilterTabs } from '@/features/users/components/account-panel'
import { AccountSectionHeader } from '@/features/users/components/account-shell'
import { useDateFormat } from '@/lib/date'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import PreviewImage from '@/shared/components/preview-image'
import { AiMagicIcon, ArrowRight02Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { useMemo, useState } from 'react'

const ALL = 'all'

const tileStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } }
}

const tileItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 20 } }
}

export default function AccountStudioGenerations() {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const { generations, isLoadingGenerations } = useStudioGenerations()

  const [scene, setScene] = useState<string>(ALL)

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

  return (
    <>
      <AccountSectionHeader
        title={t('studio.generations.title')}
        description={
          isLoadingGenerations
            ? t('studio.generations.loading')
            : t('studio.generations.count', { count: generations.length })
        }
      />

      {isLoadingGenerations ? (
        <GenerationsLoading />
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
                <motion.li key={generation.id} variants={tileItem}>
                  <GenerationTile generation={generation} dateLabel={formatDate(generation.createdAt, 'dateMedium')} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </>
      )}
    </>
  )
}

function GenerationTile({ generation, dateLabel }: { generation: StudioGeneration; dateLabel: string }) {
  const { t } = useTranslation()

  return (
    <Link
      href={`/products/${generation.productId}/studio`}
      aria-label={t('studio.generations.openInStudio', { name: generation.name })}
      className='group relative block overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
    >
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

      <span className='absolute left-2.5 top-2.5 inline-flex max-w-[calc(100%-1.25rem)] items-center gap-1 rounded-full bg-white/75 px-2 py-1 text-[0.625rem] font-semibold text-primary shadow-[0_0.25rem_0.75rem_rgb(28_43_43/10%)] backdrop-blur-md'>
        <HugeiconsIcon icon={SparklesIcon} className='size-3 shrink-0' />
        <span className='truncate'>{generation.mockupName}</span>
      </span>

      <span className='absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white'>
        <span className='min-w-0'>
          <span className='block truncate font-title text-sm font-bold leading-tight sm:text-base'>
            {generation.name}
          </span>
          <span className='mt-0.5 block truncate text-[0.6875rem] text-white/75 tabular-nums'>{dateLabel}</span>
        </span>

        <span
          aria-hidden='true'
          className='grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors duration-300 group-hover:bg-white group-hover:text-primary'
        >
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            className='size-3.5 transition-transform duration-300 group-hover:translate-x-0.5'
          />
        </span>
      </span>
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
