'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'

export default function ProductGallery({
  name,
  avatar,
  others,
  discountPercent,
  categoryName
}: {
  name: string
  avatar: string | null
  others: string[]
  discountPercent: number
  categoryName: string | null
}) {
  const { t } = useTranslation()
  const images = useMemo(() => {
    const all = [avatar, ...(others ?? [])].filter((url): url is string => Boolean(url))
    return Array.from(new Set(all))
  }, [avatar, others])

  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? null
  const hasThumbnails = images.length > 1

  return (
    <div className='space-y-4 xl:space-y-3'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-2'>
        {hasThumbnails ? (
          <div
            className={cn(
              'order-2 flex w-full items-center justify-start gap-4 overflow-x-auto p-1',
              'xl:order-1 xl:w-24 xl:flex-col xl:items-stretch xl:gap-3 xl:overflow-x-hidden xl:overflow-y-auto xl:p-1.5'
            )}
          >
            {images.map((image, index) => {
              const isActive = image === activeImage
              return (
                <button
                  key={image}
                  type='button'
                  onClick={() => setActiveIndex(index)}
                  aria-label={t('products.detail.gallery.viewImage', { index: index + 1 })}
                  aria-pressed={isActive}
                  className={cn(
                    'relative size-16 sm:size-24 xl:size-20 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl opacity-50 transition-opacity duration-300 hover:opacity-100',
                    isActive ? 'opacity-100 ring-2 ring-primary ring-offset-1' : ''
                  )}
                >
                  <Image
                    src={image}
                    alt={t('products.detail.gallery.thumbAlt', { name, index: index + 1 })}
                    fill
                    sizes='(min-width: 1280px) 5rem, (min-width: 640px) 6rem, 4rem'
                    quality={55}
                    className='object-cover'
                  />
                </button>
              )
            })}
          </div>
        ) : null}

        {activeImage ? (
          <div className='relative order-1 aspect-square w-full overflow-hidden rounded-2xl sm:rounded-4xl xl:order-2 xl:flex-1 xl:rounded-3xl'>
            <Image
              src={activeImage}
              alt={name}
              fill
              priority
              fetchPriority='high'
              sizes='(min-width: 1280px) 40rem, (min-width: 1024px) 32rem, 100vw'
              quality={70}
              className='object-cover'
            />
            {discountPercent > 0 ? (
              <span className='absolute left-3 top-3 inline-flex rounded-full bg-rose-500 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-white shadow-sm'>
                -{discountPercent}%
              </span>
            ) : null}
            {categoryName ? (
              <span className='absolute right-3 top-3 inline-flex rounded-full bg-card/95 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-primary shadow-sm ring-1 ring-foreground/5'>
                {categoryName}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
