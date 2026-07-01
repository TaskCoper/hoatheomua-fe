'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { FeedbacksCollection, FeedbacksCollectionConfigItem } from '@/types/config.type'
import { QuoteUpIcon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useMemo } from 'react'

const AUTO_INTERVAL = 10_000

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
}

const starPop: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -90 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 420, damping: 10, delay: 0.45 + i * 0.08 }
  })
}

export default function TestimonialSection() {
  const { t, locale } = useTranslation()
  const { configs } = useGetPublicConfigs<FeedbacksCollectionConfigItem, 'feedbacks.collection'>({
    group: 'feedbacks',
    key: 'feedbacks.collection'
  })

  const items = useMemo(() => {
    const raw = configs[0]?.value.value
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw) as FeedbacksCollection
      return (parsed.items ?? []).filter((item) => !item.isPlaceholder)
    } catch {
      return []
    }
  }, [configs])

  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start', duration: 30 }, [
    Autoplay({ delay: AUTO_INTERVAL, stopOnInteraction: false, stopOnMouseEnter: false })
  ])

  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-80px' }}
      variants={containerStagger}
      className='relative bg-secondary pt-4 pb-8 overflow-hidden'
    >
      <motion.div
        animate={{ rotate: [0, -8, 0, 6, 0], scale: [1, 1.08, 1, 1.04, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className='pointer-events-none absolute -left-4 top-2 sm:left-8 sm:top-4'
        aria-hidden='true'
      >
        <HugeiconsIcon icon={QuoteUpIcon} className='size-16 text-card/60 sm:size-24' />
      </motion.div>

      <div className='mx-auto w-full max-w-7xl space-y-4 px-4 py-4 relative'>
        <motion.h1 variants={fadeUp} className='text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
          {t('home.testimonial.title')}
        </motion.h1>

        {items.length > 0 && (
          <motion.div variants={fadeUp} className='overflow-hidden' ref={emblaRef}>
            <div className='flex'>
              {items.map((item) => (
                <div key={item.id} className='min-w-0 shrink-0 grow-0 basis-full'>
                  <div className='mx-auto flex w-full max-w-4xl flex-col gap-4'>
                    <p className='text-justify text-xs sm:text-sm leading-relaxed text-foreground'>
                      {item.content[locale]}
                    </p>

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
                          />
                        )}
                        <motion.div
                          whileHover={{ x: 4, scale: 1.04 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
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
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
