'use client'

import { Skeleton } from '@/components/ui/skeleton'
import StudioImage from '@/features/studio/components/studio-image'
import type { StudioScene } from '@/features/studio/types'
import { cn } from '@/shared/utils'
import { ArrowExpandDiagonal01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

const TILE_RATIO = 'aspect-[3/4]'

const EAGER_TILE_COUNT = 6
const SKELETON_TILE_COUNT = 6

interface StudioMockupGridProps {
  mockups: StudioScene[]
  selectedId: string
  loading?: boolean
  onSelect: (id: string) => void
  onExpand: (id: string) => void
}

export default function StudioMockupGrid({
  mockups,
  selectedId,
  loading = false,
  onSelect,
  onExpand
}: StudioMockupGridProps) {
  const t = useTranslations('studio.scene')

  return (
    <div className='mt-6' role='group' aria-label={t('scenesAriaLabel')}>
      <div className='grid max-w-2xl grid-cols-3 gap-2 sm:gap-3'>
        {loading
          ? Array.from({ length: SKELETON_TILE_COUNT }).map((_, index) => (
              <Skeleton key={index} className={cn('w-full rounded-2xl', TILE_RATIO)} />
            ))
          : null}
        {mockups.map((item, index) => {
          const selected = item.id === selectedId

          return (
            <button
              key={item.id}
              type='button'
              onClick={() => (selected ? onExpand(item.id) : onSelect(item.id))}
              aria-pressed={selected}
              className={cn(
                'group relative isolate block w-full cursor-pointer overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                TILE_RATIO,
                selected
                  ? '-translate-y-1 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] outline-2 outline-offset-2 outline-primary'
                  : 'shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] hover:-translate-y-1 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
              )}
            >
              <span className='absolute inset-0 block overflow-hidden bg-secondary/50'>
                <StudioImage
                  src={item.imageUrl}
                  alt=''
                  fill
                  sizes='(min-width: 1280px) 16vw, (min-width: 640px) 22vw, 31vw'
                  loading={index < EAGER_TILE_COUNT ? 'eager' : 'lazy'}
                  className='object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]'
                />
                <span
                  aria-hidden='true'
                  className='absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent'
                />
              </span>

              <span className='relative z-10 flex h-full min-w-0 flex-col justify-end p-2 text-white sm:p-3.5 lg:p-4'>
                <span className='mb-auto flex justify-end'>
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border transition-colors sm:size-7',
                      selected
                        ? 'border-white bg-white text-primary'
                        : 'border-white/50 bg-black/10 text-transparent backdrop-blur-sm'
                    )}
                  >
                    <HugeiconsIcon icon={Tick02Icon} className='size-3 sm:size-3.5' strokeWidth={2.5} />
                  </span>
                </span>

                <span className='line-clamp-2 block font-title text-xs leading-tight font-bold text-pretty text-white sm:text-sm lg:text-base'>
                  {item.name}
                </span>
                <span className='mt-1 hidden sm:block'>
                  <span className='line-clamp-2 text-xs leading-relaxed text-white/75'>{item.description}</span>
                </span>

                {selected ? (
                  <span className='mt-1.5 flex items-center gap-2 duration-500 animate-in fade-in slide-in-from-bottom-1 sm:mt-2.5'>
                    <span className='flex size-6 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110'>
                      <HugeiconsIcon icon={ArrowExpandDiagonal01Icon} className='size-3' strokeWidth={2} />
                    </span>
                    <span className='hidden truncate text-xs font-medium sm:block'>{t('fullScene')}</span>
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
