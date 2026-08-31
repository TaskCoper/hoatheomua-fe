'use client'

import { Button } from '@/components/ui/button'
import { pick, type OverviewPackages, type PackageItem } from '@/features/b2b/overview-palette'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import { CheckmarkCircle02Icon, Crown02Icon, Diamond01Icon, Flower2Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

// slug / icon / featured stay in code, keyed by the CMS package `id`. The five
// feature rows render in a fixed order; the text comes from the CMS.
const PACKAGE_META: Record<string, { slug: string; icon: typeof Flower2Icon; featured: boolean }> = {
  nhuY: { slug: 'nhu-y', icon: Flower2Icon, featured: false },
  locPhat: { slug: 'loc-phat', icon: Crown02Icon, featured: true },
  thinhVuong: { slug: 'thinh-vuong', icon: Diamond01Icon, featured: false }
}

const FEATURE_ORDER = ['pots', 'area', 'potSize', 'locations', 'care'] as const

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

export default function B2BPackagesSection({ packages, locale }: { packages: OverviewPackages; locale: Locale }) {
  const popular = pick(packages.popular, locale)
  const fromLabel = pick(packages.fromLabel, locale)
  const quarterlySuffix = pick(packages.quarterlySuffix, locale)
  const cta = pick(packages.cta, locale)

  const items = packages.items
    .map((item) => ({ item, meta: PACKAGE_META[item.id] }))
    .filter((entry): entry is { item: PackageItem; meta: (typeof PACKAGE_META)[string] } => Boolean(entry.meta))

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
          {pick(packages.title, locale)}
        </h2>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(packages.description, locale)}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:gap-5'
      >
        {items.map(({ item, meta }) => (
          <motion.article
            key={item.id}
            variants={cardItem}
            whileHover={{ y: -10, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className={`group relative flex flex-col gap-4 overflow-hidden rounded-3xl p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] sm:p-6 ${
              meta.featured
                ? 'bg-primary text-primary-foreground ring-1 ring-primary/20 lg:scale-[1.02]'
                : 'bg-card ring-1 ring-foreground/5'
            }`}
          >
            {meta.featured && (
              <span className='relative inline-flex w-fit items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground ring-1 ring-primary-foreground/25'>
                {popular}
              </span>
            )}

            <div className='relative flex items-center gap-3'>
              <motion.div
                whileHover={{ rotate: -10, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                className={`grid size-12 place-items-center rounded-2xl shadow-sm ${
                  meta.featured
                    ? 'bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20'
                    : 'bg-secondary text-primary ring-1 ring-primary/10'
                }`}
              >
                <HugeiconsIcon icon={meta.icon} className='size-6' />
              </motion.div>

              <div className='-space-y-0.5'>
                <p
                  className={`text-[0.625rem] font-semibold uppercase tracking-widest ${
                    meta.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {fromLabel}
                </p>
                <p
                  className={`font-title text-2xl font-bold leading-none ${
                    meta.featured ? 'text-primary-foreground' : 'text-primary'
                  }`}
                >
                  {pick(item.price, locale)}
                  <span
                    className={`ml-1 text-xs font-medium ${
                      meta.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {quarterlySuffix}
                  </span>
                </p>
              </div>
            </div>

            <div className='relative space-y-1.5'>
              <h3
                className={`font-title text-xl font-bold leading-tight ${
                  meta.featured ? 'text-primary-foreground' : 'text-primary'
                }`}
              >
                {pick(item.name, locale)}
              </h3>
              <p
                className={`text-xs leading-relaxed ${meta.featured ? 'text-primary-foreground/85' : 'text-foreground'}`}
              >
                {pick(item.target, locale)}
              </p>
            </div>

            <ul className='relative flex-1 space-y-2'>
              {FEATURE_ORDER.map((featureKey) => (
                <li key={featureKey} className='flex items-start gap-2 text-xs sm:text-sm'>
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className={`mt-0.5 size-4 shrink-0 ${meta.featured ? 'text-primary-foreground' : 'text-leaf'}`}
                  />
                  <span
                    className={`leading-relaxed ${meta.featured ? 'text-primary-foreground/90' : 'text-foreground'}`}
                  >
                    {pick(item.features[featureKey], locale)}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size='lg'
              variant={meta.featured ? 'secondary' : 'default'}
              className={`relative w-full ${
                meta.featured ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : ''
              }`}
            >
              <Link href={`/contact?package=${meta.slug}`}>{cta}</Link>
            </Button>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
