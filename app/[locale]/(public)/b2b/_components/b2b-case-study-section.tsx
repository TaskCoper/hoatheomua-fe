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

const PHOTOS = Array.from({ length: 18 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return { id: num, src: `/images/b2b/case-studies/indigo/${num}.jpg` }
})

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

export default function B2BCaseStudySection() {
  const { t } = useTranslation()
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const hotelName = t('b2b.caseStudies.indigo.logoAlt')
  const slides = PHOTOS.map((photo) => ({
    src: photo.src,
    alt: `${hotelName} — ${photo.id}`
  }))
  const MIN_ITEMS_PER_SET = 10
  const repeatsPerSet = Math.max(1, Math.ceil(MIN_ITEMS_PER_SET / PHOTOS.length))
  const oneSet = Array.from({ length: repeatsPerSet * PHOTOS.length }, (_, i) => PHOTOS[i % PHOTOS.length])
  const marqueeItems = [...oneSet, ...oneSet]

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

            <p className='text-xs leading-relaxed text-foreground sm:text-sm'>{t('b2b.caseStudies.indigo.summary')}</p>
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
          variants={fadeUp}
          className='group relative mt-6 -mx-5 sm:-mx-6 lg:-mx-8 overflow-hidden'
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)'
          }}
        >
          <div
            className='flex w-max items-center gap-3 sm:gap-4 animate-marquee group-hover:[animation-play-state:paused]'
            style={{ animationDuration: `${Math.max(40, oneSet.length * 5.5)}s` }}
          >
            {marqueeItems.map((photo, index) => (
              <button
                type='button'
                key={`${photo.id}-${index}`}
                onClick={() => setLightboxIndex(index % PHOTOS.length)}
                aria-label={`${hotelName} — ${photo.id}`}
                className='relative block shrink-0 h-40 sm:h-48 md:h-56 lg:h-64 aspect-4/3 overflow-hidden rounded-2xl ring-1 ring-foreground/5 shadow-[0_0.4rem_1rem_rgb(81_108_108/8%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              >
                <Image
                  src={photo.src}
                  alt={`${hotelName} — ${photo.id}`}
                  fill
                  className='object-cover transition-transform duration-500 hover:scale-105'
                  sizes='(min-width: 1024px) 22rem, (min-width: 640px) 18rem, 14rem'
                  quality={70}
                />
              </button>
            ))}
          </div>
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
