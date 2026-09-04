'use client'

import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { STUDIO_DETAIL_KEYS } from '@/features/studio/studio-data'
import type { StudioIngredient, StudioMockup, StudioProduct } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { ReactNode } from 'react'

const microLabelClass = 'text-[0.625rem] font-medium text-muted-foreground'

interface StudioReviewProps {
  product: StudioProduct
  ingredients: StudioIngredient[]
  mockup?: StudioMockup
  designName: string
  actions?: ReactNode
}

export default function StudioReview({ product, ingredients, mockup, designName, actions }: StudioReviewProps) {
  const t = useTranslations('studio')
  const tIngredients = useTranslations('studio.ingredients')

  return (
    <article className='animate-in fade-in slide-in-from-right-2 duration-300'>
      <header className='mt-7'>
        <p className={cn(microLabelClass, 'text-xs')}>{t('step3.creationName')}</p>
        <h2 className='text-pretty font-title text-5xl font-bold leading-tight text-primary'>“{designName}”</h2>
        <p className='text-xs text-muted-foreground'>{t('step3.body')}</p>
      </header>

      <dl className='mt-14 grid gap-6 rounded-3xl bg-card/40 p-6 sm:grid-cols-3'>
        <div className='min-w-0'>
          <dt className={microLabelClass}>{t('step3.yourFlowers')}</dt>
          <dd className='mt-1 truncate font-title text-base font-bold text-primary'>{product.name}</dd>
        </div>
        <div className='min-w-0'>
          <dt className={microLabelClass}>{t('step3.yourMockup')}</dt>
          <dd className='mt-1 truncate font-title text-base font-bold text-primary'>{mockup?.name}</dd>
        </div>
        <div className='min-w-0'>
          <dt className={microLabelClass}>{t('step3.price')}</dt>
          <dd className='mt-1 font-title text-base font-bold text-primary'>{product.price}</dd>
        </div>
      </dl>

      <section className='mt-14'>
        <StudioStepHeading
          title={t('step3.flowersTitle')}
          description={t('step3.flowersNote', { count: ingredients.length, name: product.name })}
          actions={actions}
        />

        <div className='mt-6 flex flex-col gap-8'>
          {ingredients.map((ingredient, index) => (
            <article key={ingredient.id} className='grid gap-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,4rem)_1fr]'>
              <div className='relative aspect-square overflow-hidden rounded-full bg-secondary/40 ring-1 ring-foreground/5'>
                <Image
                  src={ingredient.imageUrl}
                  alt={tIngredients(`${ingredient.id}.name`)}
                  fill
                  sizes='(min-width: 1024px) 11rem, (min-width: 640px) 30vw, 100vw'
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className='object-cover'
                />
              </div>

              <div className='min-w-0'>
                <p className={microLabelClass}>
                  {tIngredients(`${ingredient.id}.amount`)} · {tIngredients(`${ingredient.id}.color`)}
                </p>
                <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>
                  {tIngredients(`${ingredient.id}.name`)}
                </h3>
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  {tIngredients(`${ingredient.id}.meaning`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {mockup ? (
        <section className='mt-14'>
          <StudioStepHeading title={t('step3.sceneTitle')} description={t('step3.sceneNote')} />

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
              <p className={microLabelClass}>{t('step2.selectedScene')}</p>
              <h3 className='text-pretty font-title text-lg font-bold leading-snug text-primary'>{mockup.name}</h3>
              <p className='text-xs leading-relaxed text-muted-foreground'>{mockup.description}</p>
            </figcaption>
          </figure>

          <div className='mt-6 rounded-3xl bg-card/40 p-6'>
            <p className={microLabelClass}>{t('step2.sceneStoryLabel')}</p>
            <p className='mt-1 text-pretty font-title text-lg font-bold leading-snug text-primary'>{mockup.story}</p>

            <p className={cn(microLabelClass, 'mt-6')}>{t('step2.sceneMoodLabel')}</p>
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

      <section className='mt-14'>
        <StudioStepHeading title={t('step3.finishingTitle')} description={t('step3.finishingNote')} />

        <div className='mt-6 flex flex-col gap-4 rounded-3xl bg-card/40 p-6'>
          <dl className='flex flex-col divide-y divide-border'>
            {STUDIO_DETAIL_KEYS.map((key) => (
              <div
                key={key}
                className='grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr] sm:gap-4'
              >
                <dt className='text-xs font-semibold text-primary'>{t(`step1.details.${key}.label`)}</dt>
                <dd className='text-xs leading-relaxed text-muted-foreground'>{t(`step1.details.${key}.value`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <p className='mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground'>
        <HugeiconsIcon icon={SparklesIcon} className='mt-0.5 size-3.5 shrink-0 text-primary' />
        {t('step3.finalNote')}
      </p>
    </article>
  )
}
