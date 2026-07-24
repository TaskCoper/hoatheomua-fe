'use client'

import type { Locale } from '@/lib/i18n/routing'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { pick, type OverviewTrustBar } from '@/features/b2b/overview-palette'

// Logo image srcs come from the CMS `image` field; this map is the fallback
// (keyed by the CMS item `id`) for items authored without one.
const LOGO_SRC: Record<string, string> = {
  indigo: '/images/b2b/logos/hospitality/indigo.png',
  fusion: '/images/b2b/logos/hospitality/fusion.png',
  eastin: '/images/b2b/logos/hospitality/eastin.png',
  shinhan: '/images/b2b/logos/finance/shinhan.png',
  mbbank: '/images/b2b/logos/finance/mbbank.png',
  woori: '/images/b2b/logos/finance/woori.png',
  sevenEleven: '/images/b2b/logos/enterprise/seven-eleven.png',
  datxanh: '/images/b2b/logos/enterprise/datxanh.png',
  gsenc: '/images/b2b/logos/enterprise/gsenc.png',
  tancang: '/images/b2b/logos/enterprise/tancang.png',
  gelex: '/images/b2b/logos/enterprise/gelex.png',
  masan: '/images/b2b/logos/enterprise/masan.png'
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const statStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export default function B2BTrustBarSection({ trustBar, locale }: { trustBar: OverviewTrustBar; locale: Locale }) {
  return (
    <section aria-label={pick(trustBar.logos.ariaLabel, locale)} className='relative mt-6 sm:mt-8 md:mt-10 px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl'
      >
        <motion.dl
          variants={statStagger}
          className='grid grid-cols-3 gap-2.5 rounded-3xl bg-card/90 p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:gap-4 sm:p-5'
        >
          {trustBar.stats.map((stat) => (
            <motion.div key={stat.id} variants={fadeUp} className='space-y-0.5 text-center'>
              <dt className='order-2 text-[0.625rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs'>
                {pick(stat.label, locale)}
              </dt>
              <dd className='order-1 font-title text-2xl font-bold leading-none text-primary sm:text-3xl lg:text-4xl'>
                {pick(stat.value, locale)}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeUp}
        className='relative mx-auto mt-5 w-full max-w-7xl space-y-3 sm:space-y-4'
      >
        <p className='text-center text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs'>
          {pick(trustBar.eyebrow, locale)}
        </p>

        {trustBar.logos.groups.map((group) => {
          const MIN_ITEMS_PER_SET = 10
          const items = group.items.filter((item) => item.image || LOGO_SRC[item.id])
          if (items.length === 0) return null
          const repeatsPerSet = Math.max(1, Math.ceil(MIN_ITEMS_PER_SET / items.length))
          const oneSet = Array.from({ length: repeatsPerSet * items.length }, (_, i) => items[i % items.length])
          const allItems = [...oneSet, ...oneSet]

          return (
            <div key={group.id} className='space-y-1.5'>
              <p className='text-center text-[0.625rem] font-medium uppercase tracking-widest text-primary/70 sm:text-left sm:px-2'>
                {pick(group.label, locale)}
              </p>

              <div
                className='group relative overflow-hidden'
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)'
                }}
              >
                <div
                  className='flex w-max items-center gap-3 sm:gap-4 animate-marquee group-hover:[animation-play-state:paused]'
                  style={{ animationDuration: `${Math.max(40, oneSet.length * 5.5)}s` }}
                >
                  {allItems.map((item, index) => {
                    const name = pick(item.name, locale)
                    return (
                      <div
                        key={`${item.id}-${index}`}
                        className='flex py-3 pl-3 pr-10 items-center justify-center gap-3 rounded-2xl bg-card'
                      >
                        <div className='relative size-10 shrink-0 overflow-hidden rounded-xl bg-primary/5 sm:h-14 sm:w-14'>
                          <Image
                            src={item.image || LOGO_SRC[item.id]}
                            alt={name}
                            fill
                            className='object-cover'
                            sizes='56px'
                          />
                        </div>
                        <span className='whitespace-nowrap font-title text-sm font-semibold text-primary sm:text-base'>
                          {name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>
    </section>
  )
}
