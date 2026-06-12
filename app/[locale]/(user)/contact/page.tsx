'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import contactFlowerGarden from '@/public/images/ContactFlower.png'
import cornerOneFlower from '@/public/images/Corner1_bg_rm.png'
import cornerTwoFlower from '@/public/images/Corner2_bg_rm.png'
import cornerThreeLeaves from '@/public/images/Corner3_bg_rm.png'
import { InstagramIcon, Location01Icon, Mail01Icon, PhoneCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { SparkleDivider } from '../../(public)/_components/sparkle-dividier'
import ContactForm from './_components/contact-form'

const contactLinks = [
  { icon: InstagramIcon, labelKey: 'contact.links.instagram', valueKey: 'contact.links.instagramValue', href: '#' },
  {
    icon: Mail01Icon,
    labelKey: 'contact.links.email',
    valueKey: 'contact.links.emailValue',
    href: 'mailto:hello@hoatheomua.vn'
  },
  {
    icon: PhoneCheckIcon,
    labelKey: 'contact.links.phone',
    valueKey: 'contact.links.phoneValue',
    href: 'tel:+84901234567'
  },
  { icon: Location01Icon, labelKey: 'contact.links.address', valueKey: 'contact.links.addressValue', href: '#' }
] as const

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <section className='relative isolate overflow-hidden px-4 pt-5 pb-8 sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12'>
      <Image
        src={cornerOneFlower}
        alt=''
        aria-hidden='true'
        priority
        className='wind-wiggle-left pointer-events-none absolute top-0 -left-8 z-20 hidden h-[25rem] w-[25rem] object-contain opacity-80 lg:block xl:-left-8 xl:h-[30rem] xl:w-[30rem]'
        sizes='(min-width: 1280px) 30rem, 25rem'
      />
      <Image
        src={cornerThreeLeaves}
        alt=''
        aria-hidden='true'
        className='wind-wiggle-left pointer-events-none absolute -bottom-6 left-18 z-20 hidden h-72 w-72 -rotate-[-18deg] object-contain opacity-70 md:block lg:h-80 lg:w-80'
        sizes='(min-width: 1024px) 20rem, 18rem'
      />
      <Image
        src={cornerTwoFlower}
        alt=''
        aria-hidden='true'
        className='wind-wiggle-right pointer-events-none absolute right-8rem bottom-4 z-20 hidden h-[28rem] w-[28rem] object-contain opacity-90 lg:block xl:right-[-10rem] xl:h-[34rem] xl:w-[34rem]'
        sizes='(min-width: 1280px) 34rem, 28rem'
      />

      <div className='relative z-10 mx-auto w-full max-w-[50rem] space-y-4 sm:space-y-5'>
        <div className='mx-auto w-full max-w-4xl space-y-1.5 text-center sm:space-y-2'>
          {/* <div aria-hidden='true' className='mx-auto mb-1 flex w-fit items-center gap-2 text-[#efb8b4]'>
            <span className='h-px w-3 bg-current' />
            <span className='font-title text-2xl leading-none'>*</span>
            <span className='h-px w-3 bg-current' />
          </div> */}

          <div className='flex items-center justify-start gap-3 sm:justify-center'>
            <SparkleDivider
              className='hidden min-w-0 max-w-72 flex-1 sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              color='#516c6c'
            />

            <h1 className='shrink-0 text-balance font-title text-3xl font-bold leading-tight text-primary sm:text-4xl md:text-5xl lg:text-5xl'>
              {t('contact.header')}
            </h1>

            <SparkleDivider
              className='hidden min-w-0 max-w-72 flex-1 sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          <p className='mx-auto max-w-full text-left text-sm leading-relaxed text-foreground/80 sm:max-w-3xl sm:text-center'>
            {t('contact.subHeader')}
          </p>
        </div>

        <div className='relative z-10 overflow-hidden rounded-[1.75rem] border border-secondary/55 bg-card/75 shadow-[0_1rem_3rem_rgb(81_108_108_/_12%)] backdrop-blur-md sm:rounded-[2rem]'>
          <div className='pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(120deg,rgb(255_255_255_/_72%),rgb(238_243_240_/_48%))]' />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-y-8 left-[30%] right-4 -z-10 hidden rounded-[2rem] bg-[radial-gradient(circle_at_0%_50%,rgb(188_208_199_/_32%),transparent_30%),radial-gradient(circle_at_82%_90%,rgb(245_220_220_/_26%),transparent_30%),linear-gradient(90deg,rgb(255_255_255_/_0%),rgb(255_255_255_/_48%)_50%,rgb(238_243_240_/_58%))] blur-2xl lg:block'
          />

          <div className='relative z-10 grid grid-cols-1 items-start gap-6 p-5 sm:p-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6 lg:p-7 xl:gap-8'>
            <div className='space-y-5 lg:pr-2 xl:pr-3'>
              <div className='max-w-lg space-y-3.5'>
                {/* <p className='text-xs font-semibold text-primary sm:text-sm'>{t('contact.eyebrow')}</p> */}

                <div className='space-y-3'>
                  <h2 className='max-w-lg text-balance font-title text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-4xl'>
                    {t('contact.title')}
                  </h2>
                  <p className='max-w-md text-sm leading-6 text-foreground/80'>{t('contact.description')}</p>
                </div>
              </div>

              <div className='grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
                {contactLinks.map((link) => (
                  <a
                    key={link.valueKey}
                    href={link.href}
                    className='flex min-h-14 items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/25 px-3.5 py-2.5 text-foreground shadow-[0_0.35rem_1rem_rgb(81_108_108_/_5%)] transition-colors hover:bg-secondary/35'
                  >
                    <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground'>
                      <HugeiconsIcon icon={link.icon} strokeWidth={2} className='size-4' />
                    </span>
                    <span className='min-w-0'>
                      <span className='block text-[0.625rem] font-medium text-muted-foreground'>
                        {t(link.labelKey)}
                      </span>
                      <span className='block truncate text-xs font-semibold text-primary'>{t(link.valueKey)}</span>
                    </span>
                  </a>
                ))}
              </div>

              <div className='relative overflow-hidden rounded-[1.5rem] border border-secondary/45 bg-secondary/15 shadow-[0_0.6rem_1.5rem_rgb(81_108_108_/_8%)]'>
                <div
                  aria-hidden='true'
                  className='pointer-events-none absolute -right-10 top-10 hidden h-40 w-40 rounded-full bg-secondary/30 blur-3xl lg:block'
                />
                <Image
                  src={contactFlowerGarden}
                  alt='Vườn hoa pastel'
                  className='relative aspect-[16/9] w-full object-cover opacity-95 sm:aspect-auto sm:h-[150px] lg:h-[170px] xl:h-[190px]'
                  sizes='(min-width: 1280px) 32rem, (min-width: 1024px) 40vw, 100vw'
                />
              </div>
            </div>

            <div className='relative border-secondary/40 lg:border-l lg:pl-6'>
              {/* <div
                aria-hidden='true'
                className='pointer-events-none absolute -left-px top-1/2 hidden size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card text-[#efb8b4] shadow-[0_0_0_1px_rgb(188_208_199_/_35%)] lg:grid'
              >
                <span className='font-title text-2xl leading-none'>*</span>
              </div>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-full rounded-3xl bg-background/25 backdrop-blur-[1px] lg:hidden'
              /> */}

              <div className='relative mx-auto w-full max-w-[540px]'>
                <div className='mb-3 space-y-1'>
                  {/* <p className='text-xs font-semibold text-muted-foreground sm:text-sm'>{t('contact.form.eyebrow')}</p> */}
                  <h2 className='font-title text-3xl font-bold leading-tight text-primary sm:text-3xl'>
                    {t('contact.form.title')}
                  </h2>
                </div>

                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
