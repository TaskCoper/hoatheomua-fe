'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import slogan from '@/public/images/slogan.png'
import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const starPop: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -90 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 420, damping: 10, delay: 0.45 + i * 0.07 }
  })
}

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <div className='relative mt-6 mb-10 flex items-center justify-center w-full max-w-7xl mx-auto px-4'>
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 0.8, 0, -0.8, 0] }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut' }
        }}
        className='relative z-10 flex items-center justify-center'
      >
        <Image
          src={slogan}
          alt={t('home.hero.imageAlt')}
          className='h-64 sm:h-80 md:h-96 lg:h-110 xl:h-120 2xl:h-130 w-auto max-w-full object-contain'
          sizes='(min-width: 1280px) 60rem, (min-width: 768px) 48rem, 90vw'
          priority
          fetchPriority='high'
          quality={70}
        />
      </motion.div>

      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerStagger}
        className='absolute left-4 -bottom-6 z-20 sm:left-4 sm:-bottom-6 md:left-8 md:-bottom-2 lg:left-32 lg:bottom-0 space-y-1'
      >
        <motion.h1
          variants={fadeUp}
          className='text-lg font-bold text-foreground font-title sm:text-xl md:text-2xl lg:text-3xl'
        >
          {t('home.hero.title')}
        </motion.h1>

        <motion.div variants={fadeUp}>
          <p className='text-[0.5rem] sm:text-[0.625rem] font-medium'>{t('home.hero.tagline1')}</p>
          <p className='text-[0.5rem] sm:text-[0.625rem] font-medium'>{t('home.hero.tagline2')}</p>
          <p className='text-[0.5rem] sm:text-[0.625rem] font-medium'>{t('home.hero.tagline3')}</p>
        </motion.div>

        <motion.div variants={fadeUp} className='flex items-center gap-1.5'>
          <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, index) => (
              <motion.span
                key={index}
                custom={index}
                initial='hidden'
                animate='visible'
                variants={starPop}
                whileHover={{ scale: 1.4, rotate: 16 }}
                className='inline-flex'
              >
                <HugeiconsIcon
                  icon={StarIcon}
                  className='fill-orange-300 text-orange-400 size-2.5 sm:size-3 md:size-3.5'
                />
              </motion.span>
            ))}
          </div>
          <p className='font-medium text-[0.5rem] sm:text-[0.625rem]'>{t('home.hero.reviews')}</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14 }}
          className='inline-block'
        >
          <Button size='sm' className='h-7 px-2.5 text-xs mt-2'>
            {t('home.hero.price')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
