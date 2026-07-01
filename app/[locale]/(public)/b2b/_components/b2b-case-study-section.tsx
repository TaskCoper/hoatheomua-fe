'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { HotelIcon, QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

const PHOTOS = [
  {
    id: 'gifts',
    src: '/images/b2b/case-studies/indigo/01-gifts.jpg',
    altKey: 'b2b.caseStudies.indigo.images.gifts',
    category: 'event'
  },
  {
    id: 'winterTable',
    src: '/images/b2b/case-studies/indigo/02-winter-table.jpg',
    altKey: 'b2b.caseStudies.indigo.images.winterTable',
    category: 'weekly'
  },
  {
    id: 'orchidVase',
    src: '/images/b2b/case-studies/indigo/03-orchid-vase.jpg',
    altKey: 'b2b.caseStudies.indigo.images.orchidVase',
    category: 'room'
  },
  {
    id: 'lotusSinger',
    src: '/images/b2b/case-studies/indigo/04-lotus-singer.jpg',
    altKey: 'b2b.caseStudies.indigo.images.lotusSinger',
    category: 'room'
  },
  {
    id: 'banquetCenterpiece',
    src: '/images/b2b/case-studies/indigo/05-banquet-centerpiece.jpg',
    altKey: 'b2b.caseStudies.indigo.images.banquetCenterpiece',
    category: 'event'
  },
  {
    id: 'banquetDetail',
    src: '/images/b2b/case-studies/indigo/06-banquet-detail.jpg',
    altKey: 'b2b.caseStudies.indigo.images.banquetDetail',
    category: 'event'
  }
] as const

const CATEGORY_LABEL_KEY = {
  weekly: 'b2b.caseStudies.categories.weekly',
  event: 'b2b.caseStudies.categories.event',
  room: 'b2b.caseStudies.categories.room'
} as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const photoItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 18 } }
}

export default function B2BCaseStudySection() {
  const { t } = useTranslation()
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const slides = PHOTOS.map((photo) => ({
    src: photo.src,
    alt: t(photo.altKey)
  }))

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-1 sm:space-y-1.5 md:space-y-2'
      >
        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {t('b2b.caseStudies.title')}
        </h2>
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('b2b.caseStudies.description')}
        </p>
      </motion.div>

      <motion.article
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='relative mx-auto mt-6 w-full max-w-7xl overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 sm:p-6 lg:p-8'
      >
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8'>
          <motion.div variants={fadeUp} className='space-y-3 lg:col-span-7'>
            <div className='flex flex-wrap items-center gap-3'>
              {/* TODO(b2b): swap placeholder with Indigo Saigon Hotel SVG when brand team delivers */}
              <div
                aria-label={t('b2b.caseStudies.indigo.logoAlt')}
                className='flex h-12 items-center gap-2 rounded-xl bg-secondary/40 px-3 ring-1 ring-primary/10 sm:h-14 sm:px-4'
              >
                <HugeiconsIcon icon={HotelIcon} className='size-5 text-primary' />
                <span className='font-title text-sm font-bold tracking-tight text-primary sm:text-base'>
                  {t('b2b.caseStudies.indigo.logoAlt')}
                </span>
              </div>
              <span className='inline-flex items-center rounded-full bg-leaf/15 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-leaf ring-1 ring-leaf/20'>
                {t('b2b.caseStudies.indigo.badge')}
              </span>
            </div>

            <p className='text-xs leading-relaxed text-foreground sm:text-sm'>
              {t('b2b.caseStudies.indigo.summary')}
            </p>
          </motion.div>

          <motion.figure
            variants={fadeUp}
            className='relative flex flex-col gap-3 rounded-2xl bg-secondary/30 p-5 ring-1 ring-primary/10 lg:col-span-5'
          >
            <HugeiconsIcon
              icon={QuoteUpIcon}
              className='absolute -top-2 left-4 size-6 text-primary/40 sm:-top-3 sm:size-7'
            />
            <blockquote className='font-title text-sm italic leading-relaxed text-primary sm:text-base'>
              “{t('b2b.caseStudies.indigo.quote')}”
            </blockquote>
            <figcaption className='-space-y-0.5'>
              <span className='block font-title text-sm font-bold text-primary sm:text-base'>
                {t('b2b.caseStudies.indigo.quoteAuthor')}
              </span>
              <span className='block text-[0.6875rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs'>
                {t('b2b.caseStudies.indigo.quoteRole')}
              </span>
            </figcaption>
          </motion.figure>
        </div>

        <motion.div
          variants={cardStagger}
          className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3'
        >
          {PHOTOS.map((photo, index) => (
            <motion.button
              type='button'
              key={photo.id}
              variants={photoItem}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              onClick={() => setLightboxIndex(index)}
              aria-label={t(photo.altKey)}
              className='group relative block overflow-hidden rounded-2xl ring-1 ring-foreground/5 shadow-[0_0.4rem_1rem_rgb(81_108_108/8%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            >
              <div className='relative aspect-[4/3]'>
                <Image
                  src={photo.src}
                  alt={t(photo.altKey)}
                  fill
                  className='object-cover transition-transform duration-500 group-hover:scale-105'
                  sizes='(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw'
                  quality={70}
                />
                <span className='absolute left-2 top-2 inline-flex items-center rounded-full bg-card/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-primary ring-1 ring-primary/10 backdrop-blur-sm'>
                  {t(CATEGORY_LABEL_KEY[photo.category])}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.article>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={Math.max(0, lightboxIndex)}
        slides={slides}
        plugins={[Fullscreen, Thumbnails, Zoom]}
        thumbnails={{ position: 'bottom', showToggle: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      />
    </section>
  )
}
