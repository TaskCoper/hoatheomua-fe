'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import rightBranch from '@/public/images/right-branch.png'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { MainlineCollection, MainlineCollectionConfigItem } from '@/types/config.type'
import { ArrowRight02Icon, FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { useMemo } from 'react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.88, rotate: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 140, damping: 16 }
  }
}

export default function ProductLinesSection() {
  const { t, locale } = useTranslation()
  const { configs } = useGetPublicConfigs<MainlineCollectionConfigItem, 'products.mainline'>({
    group: 'products',
    key: 'products.mainline'
  })

  const { section, cards } = useMemo(() => {
    const raw = configs[0]?.value.value
    if (!raw) return { section: null, cards: [] }

    try {
      const parsed = JSON.parse(raw) as MainlineCollection
      return {
        section: parsed.section,
        cards: (parsed.cards ?? []).filter((card) => card.enabled)
      }
    } catch {
      return { section: null, cards: [] }
    }
  }, [configs])

  if (!section?.enabled || cards.length === 0) return null

  return (
    <section id='product-lines' className='relative mt-8 scroll-mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
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

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {section.title[locale]}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {section.description[locale]}
        </p>
      </motion.div>

      <Image
        src={rightBranch}
        alt={t('about.productLines.branchAlt')}
        className='wind-wiggle-right absolute -right-8 bottom-12 h-52 w-auto opacity-25 hidden lg:block pointer-events-none'
        aria-hidden='true'
      />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3 lg:gap-5'
      >
        {cards.map((card) => {
          const name = card.name[locale]
          const occasion = card.badge[locale]

          return (
            <motion.article
              key={card.id}
              variants={cardItem}
              whileHover={{ y: -12, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className='group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] sm:rounded-2xl lg:rounded-3xl'
            >
              <Link href={`/mainline/${card.id}`} className='flex flex-1 flex-col'>
                <div className='relative isolate h-110 w-full overflow-hidden'>
                  <Image
                    src={card.image}
                    alt={name}
                    fill
                    sizes='(min-width: 1024px) 28rem, (min-width: 640px) 33vw, 100vw'
                    className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                  />

                  {occasion ? (
                    <motion.span
                      whileHover={{ scale: 1.12, rotate: -3 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 14 }}
                      className='absolute left-3 top-3 z-10 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[0.625rem] font-medium text-primary backdrop-blur-sm ring-1 ring-foreground/5 sm:left-2 sm:top-2 sm:max-w-[calc(100%-1rem)] sm:text-[0.5625rem] md:text-[0.625rem] lg:left-3 lg:top-3 lg:max-w-[calc(100%-1.5rem)] lg:text-xs'
                    >
                      <span className='flower-wiggle inline-flex'>
                        <HugeiconsIcon icon={FlowerIcon} className='size-3.5 shrink-0' />
                      </span>
                      <span className='truncate'>{occasion}</span>
                    </motion.span>
                  ) : null}
                </div>

                <div className='flex flex-1 flex-col gap-1.5 p-4 sm:p-3 md:p-4 lg:p-5'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h2 className='font-title text-lg font-bold leading-tight text-primary sm:text-base md:text-lg lg:text-xl'>
                          {name}
                        </h2>
                      </TooltipTrigger>

                      <TooltipContent
                        className='max-w-55 rounded-2xl border border-border/50 bg-white px-3 py-2 text-xs font-medium text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)] backdrop-blur-sm'
                        iconClassName=' bg-white fill-white'
                      >
                        {name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <p className='flex-1 text-xs leading-relaxed text-foreground'>{card.description[locale]}</p>

                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                    className='mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary transition-colors group-hover:text-foreground'
                  >
                    {t('about.productLines.explore')}
                    <span className='nudge-x inline-flex'>
                      <HugeiconsIcon icon={ArrowRight02Icon} className='size-3' />
                    </span>
                  </motion.span>
                </div>
              </Link>
            </motion.article>
          )
        })}
      </motion.div>
    </section>
  )
}
