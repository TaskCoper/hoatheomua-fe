'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const STAT_KEYS = [
  {
    id: 'clients',
    valueKey: 'b2b.trustBar.stats.clients.value',
    labelKey: 'b2b.trustBar.stats.clients.label'
  },
  {
    id: 'hotels',
    valueKey: 'b2b.trustBar.stats.hotels.value',
    labelKey: 'b2b.trustBar.stats.hotels.label'
  },
  {
    id: 'events',
    valueKey: 'b2b.trustBar.stats.events.value',
    labelKey: 'b2b.trustBar.stats.events.label'
  }
] as const

const LOGO_GROUPS = [
  {
    id: 'hospitality',
    labelKey: 'b2b.trustBar.logos.groups.hospitality.label',
    items: [
      {
        id: 'indigo',
        nameKey: 'b2b.trustBar.logos.groups.hospitality.items.indigo.name',
        src: '/images/b2b/logos/hospitality/indigo.png'
      },
      {
        id: 'fusion',
        nameKey: 'b2b.trustBar.logos.groups.hospitality.items.fusion.name',
        src: '/images/b2b/logos/hospitality/fusion.png'
      },
      {
        id: 'eastin',
        nameKey: 'b2b.trustBar.logos.groups.hospitality.items.eastin.name',
        src: '/images/b2b/logos/hospitality/eastin.png'
      }
    ]
  },
  {
    id: 'finance',
    labelKey: 'b2b.trustBar.logos.groups.finance.label',
    items: [
      {
        id: 'shinhan',
        nameKey: 'b2b.trustBar.logos.groups.finance.items.shinhan.name',
        src: '/images/b2b/logos/finance/shinhan.png'
      },
      {
        id: 'mbbank',
        nameKey: 'b2b.trustBar.logos.groups.finance.items.mbbank.name',
        src: '/images/b2b/logos/finance/mbbank.png'
      },
      {
        id: 'woori',
        nameKey: 'b2b.trustBar.logos.groups.finance.items.woori.name',
        src: '/images/b2b/logos/finance/woori.png'
      }
    ]
  },
  {
    id: 'enterprise',
    labelKey: 'b2b.trustBar.logos.groups.enterprise.label',
    items: [
      {
        id: 'sevenEleven',
        nameKey: 'b2b.trustBar.logos.groups.enterprise.items.sevenEleven.name',
        src: '/images/b2b/logos/enterprise/seven-eleven.png'
      },
      {
        id: 'datxanh',
        nameKey: 'b2b.trustBar.logos.groups.enterprise.items.datxanh.name',
        src: '/images/b2b/logos/enterprise/datxanh.png'
      },
      {
        id: 'gsenc',
        nameKey: 'b2b.trustBar.logos.groups.enterprise.items.gsenc.name',
        src: '/images/b2b/logos/enterprise/gsenc.png'
      },
      {
        id: 'tancang',
        nameKey: 'b2b.trustBar.logos.groups.enterprise.items.tancang.name',
        src: '/images/b2b/logos/enterprise/tancang.png'
      },
      {
        id: 'gelex',
        nameKey: 'b2b.trustBar.logos.groups.enterprise.items.gelex.name',
        src: '/images/b2b/logos/enterprise/gelex.png'
      },
      {
        id: 'masan',
        nameKey: 'b2b.trustBar.logos.groups.enterprise.items.masan.name',
        src: '/images/b2b/logos/enterprise/masan.png'
      }
    ]
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const statStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export default function B2BTrustBarSection() {
  const { t } = useTranslation()

  return (
    <section aria-label={t('b2b.trustBar.logos.ariaLabel')} className='relative mt-6 sm:mt-8 md:mt-10 px-4'>
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
          {STAT_KEYS.map((stat) => (
            <motion.div key={stat.id} variants={fadeUp} className='space-y-0.5 text-center'>
              <dt className='order-2 text-[0.625rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs'>
                {t(stat.labelKey)}
              </dt>
              <dd className='order-1 font-title text-2xl font-bold leading-none text-primary sm:text-3xl lg:text-4xl'>
                {t(stat.valueKey)}
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
          {t('b2b.trustBar.eyebrow')}
        </p>

        {LOGO_GROUPS.map((group) => {
          const MIN_ITEMS_PER_SET = 10
          const repeatsPerSet = Math.max(1, Math.ceil(MIN_ITEMS_PER_SET / group.items.length))
          const oneSet = Array.from(
            { length: repeatsPerSet * group.items.length },
            (_, i) => group.items[i % group.items.length]
          )
          const allItems = [...oneSet, ...oneSet]

          return (
            <div key={group.id} className='space-y-1.5'>
              <p className='text-center text-[0.625rem] font-medium uppercase tracking-widest text-primary/70 sm:text-left sm:px-2'>
                {t(group.labelKey)}
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
                  {allItems.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className='flex py-3 pl-3 pr-10 items-center justify-center gap-3 rounded-2xl bg-card'
                    >
                      <div className='relative size-10 shrink-0 overflow-hidden rounded-xl bg-primary/5 sm:h-14 sm:w-14'>
                        <Image src={item.src} alt={t(item.nameKey)} fill className='object-cover' sizes='56px' />
                      </div>
                      <span className='whitespace-nowrap font-title text-sm font-semibold text-primary sm:text-base'>
                        {t(item.nameKey)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>
    </section>
  )
}
