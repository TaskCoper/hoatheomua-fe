'use client'

import type { Locale } from '@/lib/i18n/routing'
import type { FeedbackItem } from '@/types/config.type'
import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'

const AUTO_INTERVAL = 10_000

interface TestimonialCarouselProps {
  items: FeedbackItem[]
  locale: Locale
}

export default function TestimonialCarousel({ items, locale }: TestimonialCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start', duration: 30 }, [
    Autoplay({ delay: AUTO_INTERVAL, stopOnInteraction: false, stopOnMouseEnter: false })
  ])

  if (items.length === 0) return null

  return (
    <div className='overflow-hidden' ref={emblaRef}>
      <div className='flex'>
        {items.map((item) => (
          <div key={item.id} className='min-w-0 shrink-0 grow-0 basis-full'>
            <div className='mx-auto flex w-full max-w-4xl flex-col gap-4'>
              <p className='text-justify text-xs sm:text-sm leading-relaxed text-foreground'>{item.content[locale]}</p>

              <div className='flex w-full flex-row items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.customerName}
                      width={40}
                      height={40}
                      className='size-10 shrink-0 rounded-full object-cover ring-2 ring-primary/20'
                      sizes='40px'
                      quality={70}
                    />
                  )}
                  <div className='border-l-2 border-primary pl-2 transition-transform duration-200 hover:translate-x-1 hover:scale-[1.04]'>
                    <p className='font-medium text-xs sm:text-sm text-primary'>{item.customerName}</p>
                    <p className='text-[0.625rem] sm:text-xs text-muted-foreground'>{item.area}</p>
                  </div>
                </div>

                <div className='flex items-center gap-1'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className='inline-flex transition-transform duration-200 hover:scale-[1.4] hover:rotate-[16deg]'
                    >
                      <HugeiconsIcon
                        icon={StarIcon}
                        className={`size-3 sm:size-4 ${
                          index < item.rating
                            ? 'fill-orange-400 text-orange-400'
                            : 'fill-muted-foreground/20 text-muted-foreground/30'
                        }`}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
