'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { QuoteUpIcon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { SparkleDivider } from '../../_components/sparkle-dividier'
import DecorImage from './about-decor-image'

const TESTIMONIALS = [
  {
    id: 1,
    nameKey: 'about.testimonials.items.myDuyen.name',
    roleKey: 'about.testimonials.items.myDuyen.role',
    initialsKey: 'about.testimonials.items.myDuyen.initials',
    quoteKey: 'about.testimonials.items.myDuyen.quote',
    avatar: '/images/about/avatar-1.png',
    featured: true
  },
  {
    id: 2,
    nameKey: 'about.testimonials.items.vanViet.name',
    roleKey: 'about.testimonials.items.vanViet.role',
    initialsKey: 'about.testimonials.items.vanViet.initials',
    quoteKey: 'about.testimonials.items.vanViet.quote',
    avatar: '/images/about/avatar-2.png',
    featured: false
  },
  {
    id: 3,
    nameKey: 'about.testimonials.items.thanhMai.name',
    roleKey: 'about.testimonials.items.thanhMai.role',
    initialsKey: 'about.testimonials.items.thanhMai.initials',
    quoteKey: 'about.testimonials.items.thanhMai.quote',
    avatar: '/images/about/avatar-3.png',
    featured: false
  }
] as const

const featuredTestimonial = TESTIMONIALS.find((testimonial) => testimonial.featured) ?? TESTIMONIALS[0]
const otherTestimonials = TESTIMONIALS.filter((testimonial) => testimonial.id !== featuredTestimonial.id)

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -52, scale: 0.94 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } }
}

const sideStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
}

const sideItem: Variants = {
  hidden: { opacity: 0, x: 44, scale: 0.94 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

const starPop: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -90 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 420, damping: 10, delay: 0.4 + i * 0.08 }
  })
}

export default function AboutTestimonialsSection() {
  const { t } = useTranslation()
  const featuredName = t(featuredTestimonial.nameKey)

  return (
    <section className='mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
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
            {t('about.testimonials.title')}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('about.testimonials.description')}
        </p>
      </motion.div>

      <div className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-5'>
        <motion.article
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={slideInLeft}
          whileHover={{ y: -8, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className='relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.8rem_2rem_rgb(81_108_108/12%)] ring-1 ring-foreground/5 sm:p-6 lg:col-span-7'
        >
          <motion.div
            animate={{ rotate: [0, -10, 0, 8, 0], scale: [1, 1.1, 1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className='absolute -right-2 -top-2 sm:right-4 sm:top-4'
          >
            <HugeiconsIcon icon={QuoteUpIcon} className='size-24 text-secondary/30 sm:size-28' aria-hidden='true' />
          </motion.div>

          <div className='relative flex items-center gap-2'>
            <motion.span
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 360, damping: 14 }}
              className='inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-0.5 text-primary'
            >
              <motion.span
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className='size-1.5 rounded-full bg-primary'
              />
              <span className='text-[0.625rem] font-semibold'>{t('about.testimonials.featuredLabel')}</span>
            </motion.span>

            <div className='flex items-center gap-0.5'>
              {Array.from({ length: 5 }).map((_, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={starPop}
                  className='inline-flex'
                >
                  <HugeiconsIcon icon={StarIcon} className='size-3.5 fill-orange-400 text-orange-400' />
                </motion.span>
              ))}
            </div>
          </div>

          <p className='relative flex-1 text-xs leading-relaxed text-foreground sm:text-sm lg:text-base'>
            &ldquo;{t(featuredTestimonial.quoteKey)}&rdquo;
          </p>

          <div className='relative flex items-center gap-2.5 border-t border-secondary/60 pt-3'>
            <motion.div
              whileHover={{ rotate: -16, scale: 1.18 }}
              transition={{ type: 'spring', stiffness: 380, damping: 12 }}
              className='relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-title text-sm font-bold text-primary-foreground sm:size-12'
            >
              {t(featuredTestimonial.initialsKey)}
              <DecorImage src={featuredTestimonial.avatar} alt={featuredName} sizes='3rem' className='object-cover' />
            </motion.div>
            <div className='-space-y-0.5'>
              <p className='text-xs font-bold text-primary sm:text-sm'>{featuredName}</p>
              <p className='text-[0.625rem] text-muted-foreground'>{t(featuredTestimonial.roleKey)}</p>
            </div>
          </div>
        </motion.article>

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={sideStagger}
          className='grid grid-cols-1 gap-3 sm:gap-4 lg:col-span-5'
        >
          {otherTestimonials.map((testimonial) => {
            const name = t(testimonial.nameKey)
            return (
              <motion.article
                key={testimonial.id}
                variants={sideItem}
                whileHover={{ y: -8, scale: 1.025 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className='relative flex flex-col gap-2 rounded-3xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1rem_2.5rem_rgb(81_108_108/16%)] sm:p-5'
              >
                <motion.div
                  animate={{ rotate: [0, -6, 0, 4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className='absolute right-3 top-3'
                >
                  <HugeiconsIcon icon={QuoteUpIcon} className='size-7 text-secondary/60' aria-hidden='true' />
                </motion.div>

                <div className='flex items-center gap-0.5'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <motion.span
                      key={index}
                      custom={index}
                      initial='hidden'
                      whileInView='visible'
                      viewport={{ once: true }}
                      variants={starPop}
                      className='inline-flex'
                    >
                      <HugeiconsIcon icon={StarIcon} className='size-3 fill-orange-400 text-orange-400' />
                    </motion.span>
                  ))}
                </div>

                <p className='relative flex-1 text-xs leading-relaxed text-foreground/90'>{t(testimonial.quoteKey)}</p>

                <div className='flex items-center gap-2.5 border-t border-secondary/60 pt-2.5'>
                  <motion.div
                    whileHover={{ rotate: -16, scale: 1.18 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                    className='relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-title text-xs font-bold text-primary-foreground'
                  >
                    {t(testimonial.initialsKey)}
                    <DecorImage src={testimonial.avatar} alt={name} sizes='2.25rem' className='object-cover' />
                  </motion.div>
                  <div className='-space-y-0.5'>
                    <p className='text-xs font-bold text-primary'>{name}</p>
                    <p className='text-[0.625rem] text-muted-foreground'>{t(testimonial.roleKey)}</p>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
