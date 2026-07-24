'use client'

import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import {
  ArrowRight02Icon,
  Building03Icon,
  Calendar03Icon,
  GiftIcon,
  HotelIcon,
  SparklesIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import type { ServiceCard } from '@/features/b2b/service/palette'
import { pick, type OverviewServices } from '@/features/b2b/overview-palette'

// Icon / accent / package-link stay in code, keyed by service slug. The card
// text (tag/name/description) comes from each `b2bServices.<slug>` doc's `card`.
const SERVICES = [
  { id: 'outsourced', icon: HotelIcon, accent: 'primary' as const, linkToPackages: false },
  { id: 'events-mice', icon: Calendar03Icon, accent: 'primary' as const, linkToPackages: false },
  { id: 'office-subscription', icon: Building03Icon, accent: 'primary' as const, linkToPackages: true },
  { id: 'corporate-gifts', icon: GiftIcon, accent: 'primary' as const, linkToPackages: false },
  { id: 'brand-experience', icon: SparklesIcon, accent: 'leaf' as const, linkToPackages: false }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.9, rotate: -1.5 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 150, damping: 16 }
  }
}

export default function B2BServicesSection({
  services,
  cards,
  locale
}: {
  services: OverviewServices
  cards: Record<string, ServiceCard>
  locale: Locale
}) {
  const explore = pick(services.explore, locale)
  const viewPackages = pick(services.viewPackages, locale)

  // Keep only services whose card doc is present; the first surviving card is featured.
  const entries = SERVICES.map((service) => ({ ...service, card: cards[service.id] })).filter(
    (service): service is (typeof SERVICES)[number] & { card: ServiceCard } => Boolean(service.card)
  )

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {pick(services.title, locale)}
          </h2>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(services.description, locale)}
        </p>
      </motion.div>

      <motion.div
        id='b2b-services'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 scroll-mt-24'
      >
        {entries.map((service, index) => {
          const isFeatured = index === 0
          const name = pick(service.card.name, locale)
          return (
            <motion.article
              key={service.id}
              variants={cardItem}
              whileHover={{ y: -10, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className={`group relative flex flex-col gap-3 overflow-hidden rounded-3xl ring-1 sm:col-span-1 ${
                isFeatured
                  ? 'bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground ring-primary/30 shadow-[0_1rem_2.5rem_rgb(81_108_108/28%)] hover:shadow-[0_1.8rem_4rem_rgb(81_108_108/40%)] sm:col-span-2 lg:col-span-2'
                  : 'bg-card ring-foreground/5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
              }`}
            >
              <Link
                href={`/b2b/${service.id}`}
                aria-label={name}
                className={`relative flex h-full flex-col gap-3 p-5 sm:p-6 ${isFeatured ? 'lg:p-7' : ''}`}
              >
                {isFeatured && (
                  <>
                    <span
                      aria-hidden='true'
                      className='pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-leaf/25 blur-3xl'
                    />
                    <span
                      aria-hidden='true'
                      className='pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-secondary/20 blur-3xl'
                    />
                  </>
                )}

                <motion.span
                  aria-hidden='true'
                  whileHover={{ scale: 1.12, rotate: 4 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  className={`pointer-events-none absolute font-title font-bold leading-none transition-colors ${
                    isFeatured
                      ? 'right-4 -top-2 text-5xl text-secondary/35 group-hover:text-secondary/55 sm:right-5 sm:-top-3 sm:text-6xl lg:text-7xl'
                      : 'right-3 -top-1 text-5xl text-secondary/40 group-hover:text-secondary/70 sm:right-4 sm:-top-2 sm:text-6xl'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </motion.span>

                <div className='relative flex items-center gap-3'>
                  <motion.div
                    whileHover={{ rotate: -14, scale: 1.18 }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      rotate: { type: 'spring', stiffness: 380, damping: 12 },
                      scale: { type: 'spring', stiffness: 380, damping: 12 },
                      y: { duration: 2.6 + (index % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    className={`grid shrink-0 place-items-center rounded-2xl shadow-md ${
                      isFeatured
                        ? 'size-12 bg-card text-primary sm:size-14'
                        : service.accent === 'leaf'
                          ? 'size-11 bg-leaf text-leaf-foreground sm:size-12'
                          : 'size-11 bg-primary text-primary-foreground sm:size-12'
                    }`}
                  >
                    <HugeiconsIcon
                      icon={service.icon}
                      className={isFeatured ? 'size-6 sm:size-7' : 'size-5 sm:size-6'}
                    />
                  </motion.div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wide ring-1 ${
                      isFeatured
                        ? 'bg-primary-foreground/12 text-primary-foreground ring-primary-foreground/25 backdrop-blur-sm sm:text-xs'
                        : service.accent === 'leaf'
                          ? 'bg-leaf/15 text-leaf ring-leaf/20'
                          : 'bg-secondary/60 text-primary ring-primary/10'
                    }`}
                  >
                    {pick(service.card.tag, locale)}
                  </span>
                </div>

                <div className='relative flex-1 space-y-1.5'>
                  <h3
                    className={`font-title font-bold leading-tight ${
                      isFeatured
                        ? 'text-primary-foreground text-xl sm:text-2xl lg:text-[1.75rem]'
                        : 'text-primary text-lg sm:text-xl'
                    }`}
                  >
                    {name}
                  </h3>
                  <p
                    className={`leading-relaxed ${
                      isFeatured
                        ? 'max-w-2xl text-primary-foreground/85 text-xs sm:text-sm lg:text-base'
                        : 'text-foreground text-xs sm:text-sm'
                    }`}
                  >
                    {pick(service.card.description, locale)}
                  </p>
                </div>

                <div className='relative mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5'>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                    className={`inline-flex w-fit items-center gap-1 font-semibold transition-colors ${
                      isFeatured
                        ? 'text-primary-foreground hover:text-secondary text-sm lg:text-base'
                        : 'text-primary hover:text-foreground text-xs'
                    }`}
                  >
                    {explore}
                    <motion.span
                      className='inline-flex'
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <HugeiconsIcon icon={ArrowRight02Icon} className={isFeatured ? 'size-4' : 'size-3'} />
                    </motion.span>
                  </motion.div>
                </div>
              </Link>

              {service.linkToPackages && (
                <Link
                  href='#b2b-packages'
                  className='relative mx-5 mb-4 -mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-leaf transition-colors hover:text-primary sm:mx-6'
                >
                  {viewPackages}
                  <HugeiconsIcon icon={ArrowRight02Icon} className='size-3' />
                </Link>
              )}
            </motion.article>
          )
        })}
      </motion.div>
    </section>
  )
}
