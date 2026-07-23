'use client'

import type { Locale } from '@/lib/i18n/routing'
import { QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { SparkleDivider } from '../../_components/sparkle-dividier'
import { pick, type OverviewCaseStudies } from '../_overview-palette'

// Partner logo srcs come from the CMS `logo` field; this map is the fallback
// (keyed by the CMS partner `id`) for partners authored without one.
const PARTNER_LOGO: Record<string, string> = {
  fusion: '/images/b2b/logos/hospitality/fusion.png',
  masan: '/images/b2b/logos/enterprise/masan.png',
  tanCang: '/images/b2b/logos/enterprise/tancang.png',
  eastin: '/images/b2b/logos/hospitality/eastin.png'
}

const partnerCardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const partnerCardItem: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 180, damping: 18 }
  }
}

const partnerInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

const PHOTO_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '01': { width: 1706, height: 2560 },
  '02': { width: 1706, height: 2560 },
  '03': { width: 1926, height: 2568 },
  '04': { width: 1706, height: 2560 },
  '05': { width: 2560, height: 1706 },
  '06': { width: 2560, height: 1706 },
  '07': { width: 1678, height: 2560 },
  '08': { width: 2002, height: 2560 },
  '09': { width: 1706, height: 2560 },
  '10': { width: 1706, height: 2560 },
  // '11': { width: 1706, height: 2560 },
  '12': { width: 1706, height: 2560 },
  '13': { width: 2560, height: 1706 },
  '14': { width: 1708, height: 2560 },
  '15': { width: 1706, height: 2560 },
  '16': { width: 1920, height: 2560 },
  '17': { width: 1920, height: 2560 },
  '18': { width: 832, height: 1248 }
  // '20': { width: 2048, height: 1366 }
}

// Fallback gallery (local assets) used only when the CMS ships no `photos`.
const FALLBACK_PHOTOS = Object.entries(PHOTO_DIMENSIONS).map(([id, { width, height }]) => ({
  id,
  src: `/images/b2b/case-studies/indigo/${id}.jpg`,
  width,
  height
}))

// CMS photo URLs end in `-NN.jpg`; that NN keys back into PHOTO_DIMENSIONS so
// next/image gets the right aspect ratio for the marquee + lightbox.
const DEFAULT_DIM = { width: 1706, height: 2560 }
const photoNumber = (src: string) => src.match(/-(\d+)\.jpg(?:[?#]|$)/)?.[1] ?? ''

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

export default function B2BCaseStudySection({
  caseStudies,
  locale
}: {
  caseStudies: OverviewCaseStudies
  locale: Locale
}) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const { indigo, partners } = caseStudies

  const hotelName = pick(indigo.logoAlt, locale)
  const photos =
    indigo.photos.length > 0
      ? indigo.photos.map((src, i) => {
          const key = photoNumber(src)
          const dim = PHOTO_DIMENSIONS[key] ?? DEFAULT_DIM
          return { id: key || String(i + 1), src, width: dim.width, height: dim.height }
        })
      : FALLBACK_PHOTOS

  const slides = photos.map((photo) => ({
    src: photo.src,
    alt: `${hotelName} — ${photo.id}`
  }))
  const MIN_ITEMS_PER_SET = 10
  const repeatsPerSet = Math.max(1, Math.ceil(MIN_ITEMS_PER_SET / photos.length))
  const oneSet = Array.from({ length: repeatsPerSet * photos.length }, (_, i) => photos[i % photos.length])
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
          {pick(caseStudies.title, locale)}
        </h2>
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(caseStudies.description, locale)}
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
                aria-label={hotelName}
                className='flex items-center gap-2 rounded-xl bg-secondary/40 ring-1 ring-primary/10 py-1.5 pl-2 pr-3'
              >
                <Image
                  src={indigo.logo || '/images/b2b/logos/hospitality/indigo.png'}
                  alt={hotelName}
                  width={35}
                  height={35}
                  className='rounded-md'
                />
                <div className='flex flex-col -space-y-0.5'>
                  <span className='font-title text-sm font-bold tracking-tight text-primary sm:text-base'>
                    {hotelName}
                  </span>
                  <span className='text-[0.625rem] font-semibold tracking-wide'>{pick(indigo.badge, locale)}</span>
                </div>
              </div>
            </div>

            <p className='text-xs leading-relaxed text-foreground sm:text-sm'>{pick(indigo.summary, locale)}</p>
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
              “{pick(indigo.quote, locale)}”
            </blockquote>
            <figcaption className='-space-y-0.5'>
              <span className='block font-title text-sm font-bold text-primary sm:text-base'>
                {pick(indigo.quoteAuthor, locale)}
              </span>
              <span className='block text-[0.6875rem] font-medium tracking-wide text-muted-foreground sm:text-xs'>
                {pick(indigo.quoteRole, locale)}
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
            className='flex w-max items-center gap-3 sm:gap-4 animate-marquee group-hover:paused'
            style={{ animationDuration: `${Math.max(40, oneSet.length * 5.5)}s` }}
          >
            {marqueeItems.map((photo, index) => (
              <button
                type='button'
                key={`${photo.id}-${index}`}
                onClick={() => setLightboxIndex(index % photos.length)}
                aria-label={`${hotelName} — ${photo.id}`}
                className='relative block shrink-0 h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden rounded-2xl ring-1 ring-foreground/5 shadow-[0_0.4rem_1rem_rgb(81_108_108/8%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              >
                <Image
                  src={photo.src}
                  alt={`${hotelName} — ${photo.id}`}
                  width={photo.width}
                  height={photo.height}
                  className='h-full w-auto object-cover transition-transform duration-500 hover:scale-105'
                  sizes='(min-width: 1024px) 22rem, (min-width: 640px) 18rem, 14rem'
                  quality={70}
                />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.article>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto mt-10 w-full max-w-7xl space-y-1 sm:space-y-1.5 md:space-y-2 sm:mt-12'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-72 flex-1 hidden sm:flex'
            iconClassName='sm:size-4 md:size-5'
            color='#516c6c'
          />
          <h3 className='shrink-0 text-center font-title text-xl md:text-2xl lg:text-3xl font-bold text-primary'>
            {pick(partners.title, locale)}
          </h3>
          <SparkleDivider
            className='min-w-0 max-w-72 flex-1 hidden sm:flex'
            iconClassName='sm:size-4 md:size-5'
            direction='rtl'
            color='#516c6c'
          />
        </div>
        <p className='mx-auto max-w-full text-left sm:max-w-200 sm:text-center text-xs leading-relaxed text-foreground sm:text-sm'>
          {pick(partners.description, locale)}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={partnerCardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'
      >
        {partners.items.map((partner) => {
          const name = pick(partner.name, locale)
          const logoAlt = pick(partner.logoAlt, locale)
          const logoPath = partner.logo || PARTNER_LOGO[partner.id]
          return (
            <motion.article
              key={partner.id}
              variants={partnerCardItem}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className='group relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
            >
              <div className='flex items-center gap-3'>
                {logoPath ? (
                  <span className='grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/90 ring-1 ring-primary/10'>
                    <Image src={logoPath} alt={logoAlt} width={35} height={35} className='object-contain' />
                  </span>
                ) : (
                  <span
                    aria-label={logoAlt}
                    className='grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 font-title text-sm font-bold text-primary ring-1 ring-primary/10'
                  >
                    {partnerInitials(name)}
                  </span>
                )}
                <div className='min-w-0 -space-y-0.5'>
                  <h4 className='truncate font-title text-base font-bold text-primary sm:text-lg'>{name}</h4>
                  <p className='truncate text-[0.6875rem] font-medium tracking-wide text-muted-foreground sm:text-xs'>
                    {pick(partner.role, locale)}
                  </p>
                </div>
              </div>

              <p className='text-xs leading-relaxed text-foreground sm:text-sm'>{pick(partner.summary, locale)}</p>
            </motion.article>
          )
        })}
      </motion.div>

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
