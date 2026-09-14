'use client'

import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { formatStudioPrice } from '@/features/studio/studio-data'
import type { StudioBouquet, StudioMockup } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { ReactNode } from 'react'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'
const detailRowClass = 'grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
const detailTermClass = 'text-xs font-semibold text-primary'
const detailValueClass = 'text-xs leading-relaxed text-muted-foreground'

interface StudioReviewProps {
  mockup?: StudioMockup
  bouquet: StudioBouquet
  designName: string
  actions?: ReactNode
}

export default function StudioReview({ mockup, bouquet, designName, actions }: StudioReviewProps) {
  const t = useTranslations('studio')
  const tCompose = useTranslations('studio.compose')

  return (
    <article className='animate-in fade-in slide-in-from-right-2 duration-300'>
      <header className='mt-7'>
        <p className={cn(microLabelClass, 'text-xs')}>{t('review.creationName')}</p>
        <h2 className='text-pretty font-title text-5xl font-bold leading-tight text-primary'>“{designName}”</h2>
        <p className='text-xs text-muted-foreground'>{t('review.body')}</p>
      </header>

      <dl className='mt-14 grid gap-6 rounded-3xl bg-card/40 p-6 sm:grid-cols-3'>
        <div className='min-w-0'>
          <dt className={microLabelClass}>{t('review.yourFlowers')}</dt>
          <dd className='mt-1 truncate font-title text-base font-bold text-primary'>
            {bouquet.products.map((item) => item.name).join(' + ')}
          </dd>
        </div>
        <div className='min-w-0'>
          <dt className={microLabelClass}>{t('review.yourMockup')}</dt>
          <dd className='mt-1 truncate font-title text-base font-bold text-primary'>{mockup?.name}</dd>
        </div>
        <div className='min-w-0'>
          <dt className={microLabelClass}>{t('review.price')}</dt>
          <dd className='mt-1 font-title text-base font-bold text-primary'>{formatStudioPrice(bouquet.totalAmount)}</dd>
        </div>
      </dl>

      <section className='mt-14'>
        <StudioStepHeading
          title={t('review.flowersTitle')}
          description={t('review.flowersNote', { count: bouquet.products.length, name: designName })}
          actions={actions}
        />

        <div className='mt-6 flex flex-col gap-8'>
          {bouquet.products.map((item, index) => (
            <article key={item.id} className='grid gap-4 sm:grid-cols-[minmax(0,4rem)_1fr]'>
              <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                <Image
                  src={item.imageUrl}
                  alt=''
                  fill
                  sizes='(min-width: 640px) 4rem, 100vw'
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className={cn(item.imageFit === 'cover' ? 'object-cover' : 'object-contain p-1.5')}
                />
              </div>

              <div className='min-w-0'>
                <p className={microLabelClass}>
                  {index === 0 ? tCompose('bouquet.slotBase') : tCompose('bouquet.slotIndex', { slot: index + 1 })} ·{' '}
                  {formatStudioPrice(item.priceAmount)}
                </p>
                <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{item.name}</h3>
                <p className='text-xs leading-relaxed text-muted-foreground'>{item.note}</p>
              </div>
            </article>
          ))}
        </div>

        <div className='mt-8 rounded-3xl bg-card/40 p-6'>
          <dl className='flex flex-col divide-y divide-border'>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('size.label')}</dt>
              <dd className={detailValueClass}>
                {bouquet.size
                  ? `${t(`sizes.${bouquet.size.id}.name`)} · ${tCompose('size.flowerCount', { count: bouquet.size.flowerCount })}`
                  : null}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('style.label')}</dt>
              <dd className={detailValueClass}>{bouquet.style ? t(`styles.${bouquet.style.id}.name`) : null}</dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('ribbon.label')}</dt>
              <dd className={cn('flex items-center gap-2', detailValueClass)}>
                {bouquet.ribbon ? (
                  <>
                    <span
                      aria-hidden='true'
                      style={{ backgroundColor: bouquet.ribbon.color }}
                      className='size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10'
                    />
                    {t(`ribbons.${bouquet.ribbon.id}`)}
                  </>
                ) : null}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('wrap.label')}</dt>
              <dd className={cn('flex items-center gap-2', detailValueClass)}>
                {bouquet.wrap ? (
                  <>
                    <span
                      aria-hidden='true'
                      style={{ backgroundColor: bouquet.wrap.color }}
                      className='size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10'
                    />
                    {t(`wraps.${bouquet.wrap.id}`)}
                  </>
                ) : null}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>{tCompose('summary.total')}</dt>
              <dd className='font-title text-lg font-bold leading-none text-primary'>
                {formatStudioPrice(bouquet.totalAmount)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {mockup ? (
        <section className='mt-14'>
          <StudioStepHeading title={t('review.sceneTitle')} description={t('review.sceneNote')} />

          <figure className='mt-6'>
            <div className='relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary/40 ring-1 ring-foreground/5 sm:aspect-[16/10]'>
              <Image
                src={mockup.imageUrl}
                alt={mockup.name}
                fill
                sizes='(min-width: 1024px) 42vw, 100vw'
                className='object-cover'
              />
            </div>
            <figcaption className='mt-4'>
              <p className={microLabelClass}>{t('scene.selectedScene')}</p>
              <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{mockup.name}</h3>
              <p className='text-xs leading-relaxed text-muted-foreground'>{mockup.description}</p>
            </figcaption>
          </figure>

          <div className='mt-6 rounded-3xl bg-card/40 p-6'>
            <p className={microLabelClass}>{t('scene.sceneStoryLabel')}</p>
            <p className='mt-1 text-pretty font-title text-lg font-bold leading-snug text-primary'>{mockup.story}</p>

            <p className={cn(microLabelClass, 'mt-6')}>{t('scene.sceneMoodLabel')}</p>
            <ul className='mt-1 flex flex-wrap gap-2'>
              {mockup.moods.map((mood) => (
                <li
                  key={mood}
                  className='rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground'
                >
                  {mood}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <p className='mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('review.finalNote')}
      </p>
    </article>
  )
}
