'use client'

import StudioImage from '@/features/studio/components/studio-image'
import StudioMockupGrid from '@/features/studio/components/studio-mockup-grid'
import StudioOptionsFooter from '@/features/studio/components/studio-options-footer'
import StudioOptionSkeletons from '@/features/studio/components/studio-skeletons'
import StudioStepHeading from '@/features/studio/components/studio-step-heading'
import { STUDIO_SESSION_STYLE_STEP } from '@/features/studio/studio-data'
import type { StudioOption, StudioScene, StudioStep } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

interface StudioRegeneratePanelProps {
  step: StudioStep
  styleOptions: StudioOption[]
  sceneOptions: StudioScene[]
  selectedStyleId: string
  selectedSceneId: string
  isGettingStyleOptions: boolean
  isGettingSceneOptions: boolean
  isGettingMoreStyleOptions: boolean
  isGettingMoreSceneOptions: boolean
  hasMoreStyleOptions: boolean
  hasMoreSceneOptions: boolean
  isRegenerating: boolean
  actions?: ReactNode
  onLoadMoreStyleOptions: () => void
  onLoadMoreSceneOptions: () => void
  onSelectStyle: (id: string) => void
  onSelectScene: (id: string) => void
  onExpandScene: () => void
}

export default function StudioRegeneratePanel({
  step,
  styleOptions,
  sceneOptions,
  selectedStyleId,
  selectedSceneId,
  isGettingStyleOptions,
  isGettingSceneOptions,
  isGettingMoreStyleOptions,
  isGettingMoreSceneOptions,
  hasMoreStyleOptions,
  hasMoreSceneOptions,
  isRegenerating,
  actions,
  onLoadMoreStyleOptions,
  onLoadMoreSceneOptions,
  onSelectStyle,
  onSelectScene,
  onExpandScene
}: StudioRegeneratePanelProps) {
  const t = useTranslations('studio.regenerate')
  const tCompose = useTranslations('studio.compose')
  const tScene = useTranslations('studio.scene')

  return (
    <fieldset disabled={isRegenerating} className='contents'>
      {step === STUDIO_SESSION_STYLE_STEP ? (
        <section className='mt-7 animate-in fade-in slide-in-from-right-2 duration-300'>
          <StudioStepHeading title={t('chooseStyleTitle')} description={t('chooseStyleNote')} actions={actions} />

          <div
            role='radiogroup'
            aria-label={tCompose('style.label')}
            className='mt-6 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3'
          >
            {isGettingStyleOptions ? (
              <StudioOptionSkeletons count={6} className='aspect-[3/4] w-full rounded-2xl' />
            ) : null}
            {styleOptions.map((style, index) => {
              const selected = style.id === selectedStyleId

              return (
                <button
                  key={style.id}
                  type='button'
                  role='radio'
                  aria-checked={selected}
                  onClick={() => onSelectStyle(style.id)}
                  className={cn(
                    'group relative isolate block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none',
                    selected
                      ? '-translate-y-1 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] outline-2 outline-offset-2 outline-primary'
                      : 'shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
                  )}
                >
                  <span className='absolute inset-0 block overflow-hidden bg-secondary/50'>
                    <StudioImage
                      src={style.imageUrl}
                      alt=''
                      fill
                      sizes='(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 45vw'
                      loading={index < 4 ? 'eager' : 'lazy'}
                      className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]'
                    />
                    <span
                      aria-hidden='true'
                      className='absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent'
                    />
                  </span>

                  <span className='relative z-10 flex h-full min-w-0 flex-col justify-end p-3 text-white'>
                    <span className='mb-auto flex justify-end'>
                      <span
                        className={cn(
                          'flex size-6 items-center justify-center rounded-full border transition-colors',
                          selected
                            ? 'border-white bg-white text-primary'
                            : 'border-white/50 bg-black/10 text-transparent backdrop-blur-sm'
                        )}
                      >
                        <HugeiconsIcon icon={Tick02Icon} className='size-3' strokeWidth={2.5} />
                      </span>
                    </span>

                    <span className='block text-pretty font-title text-sm font-bold leading-tight text-white'>
                      {style.name}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className='mt-4 flex justify-center'>
            <StudioOptionsFooter
              count={styleOptions.length}
              loading={isGettingStyleOptions}
              loadingMore={isGettingMoreStyleOptions}
              hasMore={hasMoreStyleOptions}
              onLoadMore={onLoadMoreStyleOptions}
            />
          </div>
        </section>
      ) : (
        <div className='animate-in fade-in slide-in-from-right-2 duration-300'>
          <section className='mt-7'>
            <StudioStepHeading
              title={tScene('chooseTitle')}
              description={tScene('chooseNote', { count: sceneOptions.length })}
              actions={actions}
            />

            <StudioMockupGrid
              mockups={sceneOptions}
              selectedId={selectedSceneId}
              loading={isGettingSceneOptions}
              onSelect={onSelectScene}
              onExpand={onExpandScene}
            />

            <div className='mt-4 flex justify-center'>
              <StudioOptionsFooter
                count={sceneOptions.length}
                loading={isGettingSceneOptions}
                loadingMore={isGettingMoreSceneOptions}
                hasMore={hasMoreSceneOptions}
                onLoadMore={onLoadMoreSceneOptions}
              />
            </div>
          </section>
        </div>
      )}
    </fieldset>
  )
}
