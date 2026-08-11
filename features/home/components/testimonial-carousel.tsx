'use client'

import type { Locale } from '@/lib/i18n/routing'
import type { FeedbackItem } from '@/types/config.type'
import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const AUTO_INTERVAL = 10_000

const starPop: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -90 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 420, damping: 10, delay: 0.2 + i * 0.06 }
  })
}

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
                    <motion.div
                      whileHover={{ rotate: -12, scale: 1.12 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                      className='shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20'
                    >
                      <Image
                        src={item.image}
                        alt={item.customerName}
                        width={40}
                        height={40}
                        className='size-10 object-cover'
                        sizes='40px'
                        quality={70}
                      />
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ x: 4, scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                    className='border-l-2 border-primary pl-2'
                  >
                    <p className='font-medium text-xs sm:text-sm text-primary'>{item.customerName}</p>
                    <p className='text-[0.625rem] sm:text-xs text-muted-foreground'>{item.area}</p>
                  </motion.div>
                </div>

                <div className='flex items-center gap-1'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <motion.span
                      key={index}
                      custom={index}
                      initial='hidden'
                      whileInView='visible'
                      viewport={{ once: true }}
                      variants={starPop}
                      whileHover={{ scale: 1.4, rotate: 16 }}
                      className='inline-flex'
                    >
                      <HugeiconsIcon
                        icon={StarIcon}
                        className={`size-3 sm:size-4 ${
                          index < item.rating
                            ? 'fill-orange-400 text-orange-400'
                            : 'fill-muted-foreground/20 text-muted-foreground/30'
                        }`}
                      />
                    </motion.span>
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
