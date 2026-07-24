'use client'

import { Button } from '@/components/ui/button'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import type { ContactConfigItem } from '@/types/config.type'
import { ArrowRight02Icon, Mail01Icon, PhoneCheckIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { pick, type OverviewCta } from '@/features/b2b/overview-palette'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

export default function B2BCtaSection({ cta, locale }: { cta: OverviewCta; locale: Locale }) {
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const phone = contactConfigs.find((item) => item.key === 'contact.phone')?.value.value
  const email = contactConfigs.find((item) => item.key === 'contact.email')?.value.value

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4 pb-10 sm:pb-12 lg:pb-14'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={containerStagger}
        className='relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] sm:p-8 lg:p-10'
      >
        <motion.span
          aria-hidden='true'
          animate={{ rotate: [0, 12, 0, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className='pointer-events-none absolute -right-8 -bottom-10 font-title text-[10rem] font-bold leading-none text-primary-foreground/8 sm:text-[14rem]'
        >
          {pick(cta.eyebrow, locale)}
        </motion.span>

        <div className='relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10'>
          <motion.div variants={containerStagger} className='space-y-3'>
            <motion.div variants={fadeUp} className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground ring-1 ring-primary-foreground/25 sm:text-xs'>
                <HugeiconsIcon icon={SparklesIcon} className='size-3.5' />
                {pick(cta.eyebrow, locale)}
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className='font-title text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl'
            >
              {pick(cta.title, locale)}
            </motion.h2>

            <motion.p variants={fadeUp} className='text-sm leading-relaxed text-primary-foreground/85 sm:text-base'>
              {pick(cta.description, locale)}
            </motion.p>

            <motion.div variants={fadeUp} className='flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center'>
              <Button
                asChild
                size='lg'
                variant='secondary'
                className='w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto'
              >
                <Link href='/contact'>
                  {pick(cta.primary, locale)}
                  <HugeiconsIcon icon={ArrowRight02Icon} />
                </Link>
              </Button>

              <Button
                asChild
                size='lg'
                variant='ghost'
                className='w-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto'
              >
                <Link href='/products'>{pick(cta.secondary, locale)}</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={containerStagger} className='flex flex-col gap-2.5'>
            <motion.a
              variants={fadeUp}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              href={phone ? `tel:${phone.replace(/\s+/g, '')}` : '#'}
              className='flex items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3 ring-1 ring-primary-foreground/20 transition-colors hover:bg-primary-foreground/15'
            >
              <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary-foreground text-primary'>
                <HugeiconsIcon icon={PhoneCheckIcon} className='size-5' />
              </span>
              <span className='min-w-0 -space-y-0.5'>
                <span className='block text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground/70'>
                  {pick(cta.callLabel, locale)}
                </span>
                <span className='block truncate font-title text-base font-bold text-primary-foreground sm:text-lg'>
                  {phone}
                </span>
              </span>
            </motion.a>

            <motion.a
              variants={fadeUp}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              href={email ? `mailto:${email}` : '#'}
              className='flex items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3 ring-1 ring-primary-foreground/20 transition-colors hover:bg-primary-foreground/15'
            >
              <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary-foreground text-primary'>
                <HugeiconsIcon icon={Mail01Icon} className='size-5' />
              </span>
              <span className='min-w-0 -space-y-0.5'>
                <span className='block text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground/70'>
                  {pick(cta.emailLabel, locale)}
                </span>
                <span className='block truncate font-title text-base font-bold text-primary-foreground sm:text-lg'>
                  {email}
                </span>
              </span>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
