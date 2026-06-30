'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useGetConfigs } from '@/hooks/use-get-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import rightBranch from '@/public/images/right-branch.png'
import { OccasionsCollection, OccasionsCollectionConfigItem } from '@/types/config.type'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useMemo } from 'react'
import { SparkleDivider } from '../../_components/sparkle-dividier'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 16 }
  }
}

export default function ProductsOccasionsSection() {
  const { t, locale } = useTranslation()
  const { configs } = useGetConfigs<OccasionsCollectionConfigItem>({ group: 'occasions' })

  const cards = useMemo(() => {
    const raw = configs.find((c) => c.key === 'occasions.collection')?.value.value
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw) as OccasionsCollection
      return (parsed.cards ?? []).filter((card) => card.enabled)
    } catch {
      return []
    }
  }, [configs])

  return (
    <section id='occasion' className='relative mt-4 scroll-mt-8 px-4 sm:mt-6 md:mt-8 lg:mt-10'>
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
            {t('products.occasions.title')}
          </h2>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('products.occasions.description')}
        </p>
      </motion.div>

      <Image
        src={rightBranch}
        alt={t('products.occasions.branchAlt')}
        className='wind-wiggle-right absolute -right-8 top-20 h-52 w-auto opacity-25 hidden lg:block pointer-events-none'
        aria-hidden='true'
      />

      {cards.length > 0 && (
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={cardStagger}
          className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6'
        >
          {cards.map((card) => {
            const name = card.name[locale]

            return (
              <motion.article
                key={card.id}
                variants={cardItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className='group relative flex h-44 overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)]'
              >
                <div className='relative w-2/5 shrink-0 overflow-hidden'>
                  <Image
                    src={card.image}
                    alt={name}
                    fill
                    sizes='(min-width: 1024px) 16rem, (min-width: 640px) 14rem, 12rem'
                    className='object-cover'
                  />
                  <div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent to-card'
                  />
                </div>

                <div className='flex flex-1 flex-col justify-between gap-2 p-4 lg:p-5'>
                  <div className='space-y-1.5'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h2 className='line-clamp-1 font-title text-lg font-bold leading-tight text-primary lg:text-xl'>
                            {name}
                          </h2>
                        </TooltipTrigger>

                        <TooltipContent
                          className='max-w-55 rounded-3xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)] backdrop-blur-sm'
                          iconClassName=' bg-white fill-white'
                        >
                          {name}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <p className='line-clamp-2 text-xs leading-relaxed text-foreground'>{card.description[locale]}</p>
                  </div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                    className='inline-flex w-fit'
                  >
                    <Button
                      asChild
                      variant='link'
                      size='sm'
                      className='h-auto gap-1 px-0 text-xs font-semibold text-primary hover:text-foreground'
                    >
                      <Link href={`/occasions/${card.id}`}>
                        {t('products.occasions.explore')}
                        <motion.span
                          className='inline-flex'
                          animate={{ x: [0, 6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <HugeiconsIcon icon={ArrowRight02Icon} className='size-3' />
                        </motion.span>
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}
