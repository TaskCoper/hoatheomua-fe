'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { CheckmarkCircle02Icon, Crown02Icon, Diamond01Icon, Flower2Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const PACKAGES = [
  {
    id: 'nhuY',
    slug: 'nhu-y',
    icon: Flower2Icon,
    nameKey: 'b2b.packages.items.nhuY.name',
    targetKey: 'b2b.packages.items.nhuY.target',
    priceKey: 'b2b.packages.items.nhuY.price',
    featured: false,
    featureKeys: [
      'b2b.packages.items.nhuY.features.pots',
      'b2b.packages.items.nhuY.features.area',
      'b2b.packages.items.nhuY.features.potSize',
      'b2b.packages.items.nhuY.features.locations',
      'b2b.packages.items.nhuY.features.care'
    ] as const
  },
  {
    id: 'locPhat',
    slug: 'loc-phat',
    icon: Crown02Icon,
    nameKey: 'b2b.packages.items.locPhat.name',
    targetKey: 'b2b.packages.items.locPhat.target',
    priceKey: 'b2b.packages.items.locPhat.price',
    featured: true,
    featureKeys: [
      'b2b.packages.items.locPhat.features.pots',
      'b2b.packages.items.locPhat.features.area',
      'b2b.packages.items.locPhat.features.potSize',
      'b2b.packages.items.locPhat.features.locations',
      'b2b.packages.items.locPhat.features.care'
    ] as const
  },
  {
    id: 'thinhVuong',
    slug: 'thinh-vuong',
    icon: Diamond01Icon,
    nameKey: 'b2b.packages.items.thinhVuong.name',
    targetKey: 'b2b.packages.items.thinhVuong.target',
    priceKey: 'b2b.packages.items.thinhVuong.price',
    featured: false,
    featureKeys: [
      'b2b.packages.items.thinhVuong.features.pots',
      'b2b.packages.items.thinhVuong.features.area',
      'b2b.packages.items.thinhVuong.features.potSize',
      'b2b.packages.items.thinhVuong.features.locations',
      'b2b.packages.items.thinhVuong.features.care'
    ] as const
  }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 16 } }
}

export default function B2BPackagesSection() {
  const { t } = useTranslation()

  return (
    <section
      id='b2b-packages'
      className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 overflow-hidden bg-secondary/40 py-6 sm:py-8 lg:py-10'
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-25'
        style={{
          backgroundImage: "url('/images/about/pattern.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='relative mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 px-4'
      >
        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {t('b2b.packages.title')}
        </h2>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('b2b.packages.description')}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:gap-5'
      >
        {PACKAGES.map((pkg) => (
          <motion.article
            key={pkg.id}
            variants={cardItem}
            whileHover={{ y: -10, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className={`group relative flex flex-col gap-4 overflow-hidden rounded-3xl p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] sm:p-6 ${
              pkg.featured
                ? 'bg-primary text-primary-foreground ring-1 ring-primary/20 lg:scale-[1.02]'
                : 'bg-card ring-1 ring-foreground/5'
            }`}
          >
            {pkg.featured && (
              <span
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 opacity-10'
                style={{
                  backgroundImage: "url('/images/about/botanical-pattern-sage.png')",
                  backgroundRepeat: 'repeat',
                  backgroundSize: '16rem'
                }}
              />
            )}

            {pkg.featured && (
              <span className='relative inline-flex w-fit items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground ring-1 ring-primary-foreground/25'>
                {t('b2b.packages.popular')}
              </span>
            )}

            <div className='relative flex items-center gap-3'>
              <motion.div
                whileHover={{ rotate: -10, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                className={`grid size-12 place-items-center rounded-2xl shadow-sm ${
                  pkg.featured
                    ? 'bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20'
                    : 'bg-secondary text-primary ring-1 ring-primary/10'
                }`}
              >
                <HugeiconsIcon icon={pkg.icon} className='size-6' />
              </motion.div>

              <div className='-space-y-0.5'>
                <p
                  className={`text-[0.625rem] font-semibold uppercase tracking-widest ${
                    pkg.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {t('b2b.packages.fromLabel')}
                </p>
                <p
                  className={`font-title text-2xl font-bold leading-none ${
                    pkg.featured ? 'text-primary-foreground' : 'text-primary'
                  }`}
                >
                  {t(pkg.priceKey)}
                  <span
                    className={`ml-1 text-xs font-medium ${
                      pkg.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {t('b2b.packages.quarterlySuffix')}
                  </span>
                </p>
              </div>
            </div>

            <div className='relative space-y-1.5'>
              <h3
                className={`font-title text-xl font-bold leading-tight ${
                  pkg.featured ? 'text-primary-foreground' : 'text-primary'
                }`}
              >
                {t(pkg.nameKey)}
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  pkg.featured ? 'text-primary-foreground/85' : 'text-foreground'
                }`}
              >
                {t(pkg.targetKey)}
              </p>
            </div>

            <ul className='relative flex-1 space-y-2'>
              {pkg.featureKeys.map((featureKey) => (
                <li key={featureKey} className='flex items-start gap-2 text-xs sm:text-sm'>
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className={`mt-0.5 size-4 shrink-0 ${pkg.featured ? 'text-primary-foreground' : 'text-leaf'}`}
                  />
                  <span
                    className={`leading-relaxed ${
                      pkg.featured ? 'text-primary-foreground/90' : 'text-foreground'
                    }`}
                  >
                    {t(featureKey)}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size='lg'
              variant={pkg.featured ? 'secondary' : 'default'}
              className={`relative w-full ${
                pkg.featured ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : ''
              }`}
            >
              <Link href={`/contact?package=${pkg.slug}`}>{t('b2b.packages.cta')}</Link>
            </Button>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
