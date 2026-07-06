'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { Link } from '@/lib/i18n/navigation'
import type { ContactConfigItem } from '@/types/config.type'
import { ArrowRight01Icon, HomeIcon, MailValidation01Icon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { SparkleDivider } from './sparkle-dividier'

type BreadcrumbStep = { label: string; href?: string }

export type PolicyContactStrings = {
  title: string
  description: string
  hotlineLabel: string
  emailLabel: string
}

type PolicyPageShellProps = {
  eyebrow: string
  title: string
  subtitle?: string
  breadcrumb: BreadcrumbStep[]
  homeLabel: string
  effectiveDate?: string
  contact: PolicyContactStrings
  children: ReactNode
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } }
}

export default function PolicyPageShell({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
  homeLabel,
  effectiveDate,
  contact,
  children
}: PolicyPageShellProps) {
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const hotlineValue = contactConfigs.find((item) => item.key === 'contact.phone')?.value.value ?? ''
  const emailValue = contactConfigs.find((item) => item.key === 'contact.email')?.value.value ?? ''

  return (
    <div className='relative'>
      <motion.section
        initial='hidden'
        animate='visible'
        variants={stagger}
        className='relative isolate px-4 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-8 lg:pb-10'
      >
        <span
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-[radial-gradient(circle_at_25%_0%,rgb(188_208_199_/_42%),transparent_55%),radial-gradient(circle_at_85%_15%,rgb(245_220_220_/_30%),transparent_50%)]'
        />

        <motion.nav
          variants={fadeUp}
          aria-label={breadcrumb[breadcrumb.length - 1]?.label}
          className='mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-1.5 gap-y-1 rounded-2xl bg-card/70 px-3.5 py-2 text-xs text-muted-foreground ring-1 ring-foreground/5 backdrop-blur-sm sm:w-fit sm:rounded-full sm:px-4'
        >
          <Link href='/' className='inline-flex items-center gap-1.5 transition-colors hover:text-primary'>
            <HugeiconsIcon icon={HomeIcon} className='size-3.5' />
            <span>{homeLabel}</span>
          </Link>
          {breadcrumb.map((step, index) => {
            const isLast = index === breadcrumb.length - 1

            return (
              <span key={step.label} className='inline-flex items-center gap-1.5'>
                <HugeiconsIcon icon={ArrowRight01Icon} className='size-3 text-foreground/40' aria-hidden='true' />
                {isLast || !step.href ? (
                  <span className='line-clamp-1 font-semibold text-primary'>{step.label}</span>
                ) : (
                  <Link href={step.href} className='transition-colors hover:text-primary'>
                    {step.label}
                  </Link>
                )}
              </span>
            )
          })}
        </motion.nav>

        <motion.div variants={fadeUp} className='mx-auto mt-6 w-full max-w-7xl space-y-2 sm:space-y-3 md:space-y-4'>
          <p className='text-center text-[0.625rem] font-semibold uppercase tracking-widest text-primary/70 sm:text-xs'>
            {eyebrow}
          </p>

          <div className='flex items-center justify-center gap-3'>
            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              color='#516c6c'
            />
            <h1 className='min-w-0 flex-1 text-balance text-center font-title text-xl font-bold leading-tight text-primary sm:flex-none sm:shrink-0 sm:text-2xl md:text-3xl lg:text-4xl'>
              {title}
            </h1>
            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          {subtitle ? (
            <p className='mx-auto max-w-3xl text-justify text-xs leading-relaxed text-foreground/85 sm:text-center sm:text-sm'>
              {subtitle}
            </p>
          ) : null}

          {effectiveDate ? (
            <p className='text-center text-[0.625rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs'>
              {effectiveDate}
            </p>
          ) : null}
        </motion.div>
      </motion.section>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className='mx-auto w-full max-w-5xl px-3 pb-12 sm:px-4 sm:pb-16'
      >
        <div className='space-y-5 sm:space-y-6'>{children}</div>

        <motion.aside
          variants={fadeUp}
          className='mt-8 overflow-hidden rounded-3xl bg-primary p-5 shadow-[0_0.8rem_2rem_rgb(81_108_108/16%)] sm:p-6 lg:p-7'
        >
          <div className='relative grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto] lg:gap-6'>
            <div className='space-y-1.5'>
              <h2 className='font-title text-primary-foreground font-bold leading-tight sm:text-md'>{contact.title}</h2>
              <p className='text-xs leading-relaxed text-primary-foreground/85'>{contact.description}</p>
            </div>

            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-2.5'>
              <a
                href={hotlineValue ? `tel:${hotlineValue.replace(/\s+/g, '')}` : '#'}
                className='group flex items-center gap-2 rounded-2xl bg-primary-foreground/12 px-3 py-2 ring-1 ring-primary-foreground/15 transition-colors hover:bg-primary-foreground/20'
              >
                <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20'>
                  <HugeiconsIcon icon={SmartPhone01Icon} className='size-4' />
                </span>
                <span className='-space-y-0.5'>
                  <span className='block text-[0.625rem] font-medium uppercase tracking-widest text-primary-foreground/65'>
                    {contact.hotlineLabel}
                  </span>
                  <span className='block whitespace-nowrap text-xs font-bold text-primary-foreground sm:text-sm'>
                    {hotlineValue}
                  </span>
                </span>
              </a>

              <a
                href={emailValue ? `mailto:${emailValue}` : '#'}
                className='group flex items-center gap-2 rounded-2xl bg-primary-foreground/12 px-3 py-2 ring-1 ring-primary-foreground/15 transition-colors hover:bg-primary-foreground/20'
              >
                <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20'>
                  <HugeiconsIcon icon={MailValidation01Icon} className='size-4' />
                </span>
                <span className='-space-y-0.5'>
                  <span className='block text-[0.625rem] font-medium uppercase tracking-widest text-primary-foreground/65'>
                    {contact.emailLabel}
                  </span>
                  <span className='block truncate text-xs font-bold text-primary-foreground sm:text-sm'>
                    {emailValue}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </div>
  )
}
