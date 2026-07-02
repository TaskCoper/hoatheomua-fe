import { contactLinks } from '@/features/contact/constants'
import { buildContactJsonLd, generateContactMetadata } from '@/features/contact/seo'
import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import contactFlowerGarden from '@/public/images/contact-removebg-preview.png'
import cornerOneFlower from '@/public/images/Corner1_bg_rm.png'
import cornerTwoFlower from '@/public/images/Corner2_bg_rm.png'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { SparkleDivider } from '../_components/sparkle-dividier'
import ContactForm from './_components/contact-form'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateContactMetadata(locale)
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations()

  return (
    <>
      <JsonLd data={buildContactJsonLd(locale)} />

      <section className='relative isolate overflow-hidden px-4 pt-5 pb-8 sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12'>
        <Image
          src={cornerOneFlower}
          alt=''
          aria-hidden='true'
          priority
          className='wind-wiggle-left pointer-events-none absolute top-0 left-[clamp(-8rem,-5vw,-2rem)] z-1 hidden h-[clamp(18rem,28vw,34rem)] w-[clamp(18rem,28vw,34rem)] object-contain opacity-80 lg:block'
          sizes='28vw'
        />

        <Image
          src={cornerTwoFlower}
          alt=''
          aria-hidden='true'
          className='wind-wiggle-right pointer-events-none absolute right-[clamp(-10rem,-7vw,-2rem)] bottom-[clamp(1rem,2vw,2.5rem)] z-1 hidden h-[clamp(20rem,30vw,38rem)] w-[clamp(20rem,30vw,38rem)] object-contain opacity-90 lg:block'
          sizes='30vw'
        />

        <div className='relative z-10 mx-auto w-full max-w-6xl space-y-4 sm:space-y-5'>
          <div className='mx-auto w-full max-w-4xl space-y-1.5 text-center sm:space-y-2'>
            <div className='flex items-center justify-start gap-3 sm:justify-center'>
              <div className='mx-auto grid w-full max-w-[88rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4'>
                <SparkleDivider
                  className='hidden w-full min-w-[4rem] max-w-[14rem] xl:flex'
                  iconClassName='xl:size-6 2xl:size-7'
                  color='#516c6c'
                />

                <h1 className='min-w-0 max-w-none max-[380px]:text-[1.4rem]  whitespace-nowrap text-center font-title text-[clamp(1.875rem,3vw,3.25rem)] font-bold leading-none text-primary md:max-xl:col-start-2 md:max-xl:justify-self-center'>
                  {t('contact.header')}
                </h1>

                <SparkleDivider
                  className='hidden w-full min-w-[4rem] max-w-[14rem] xl:flex'
                  iconClassName='xl:size-6 2xl:size-7'
                  direction='rtl'
                  color='#516c6c'
                />
              </div>
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

            <div className='relative z-10 grid grid-cols-1 items-start gap-6 p-5 sm:p-6 md:max-lg:gap-4 md:max-lg:p-4 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6 lg:p-7 xl:gap-8'>
              <div className='space-y-5 md:max-lg:space-y-3 lg:pr-2 xl:pr-3'>
                <div className='mx-auto max-w-lg space-y-3.5 md:max-lg:space-y-3 lg:mx-0'>
                  <div className='mx-auto w-full max-w-[540px] space-y-3.5 md:max-lg:space-y-3 lg:mx-0'>
                    <div className='md:max-lg:hidden'>
                      <h2 className='mx-auto w-full max-w-[540px] text-center text-balance font-title text-3xl font-bold leading-tight text-primary sm:text-4xl lg:mx-0 lg:text-left lg:text-4xl mb-4'>
                        {t('contact.title')}
                      </h2>

                      <p className='mx-auto w-full max-w-[540px] text-center text-sm leading-6 text-foreground/80 lg:mx-0 lg:text-left'>
                        {t('contact.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='grid gap-2.5 sm:grid-cols-2 md:max-lg:mx-auto md:max-lg:w-full md:max-lg:max-w-[540px] lg:grid-cols-1 xl:grid-cols-2'>
                  {contactLinks.map((link) => (
                    <a
                      key={link.valueKey}
                      href={link.href}
                      className='flex min-h-14 min-w-0 items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/25 px-3.5 py-2.5 text-foreground shadow-[0_0.35rem_1rem_rgb(81_108_108_/_5%)] transition-colors hover:bg-secondary/35'
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

                <Image
                  src={contactFlowerGarden}
                  alt='Vườn hoa pastel'
                  className='relative mt-10'
                  sizes='(min-width: 1280px) 32rem, (min-width: 1024px) 40vw, 100vw'
                />
              </div>

              <div className='relative border-secondary/40 lg:border-l lg:pl-6'>
                <div className='relative mx-auto w-full max-w-[540px]'>
                  <div className='mb-3 space-y-1'>
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
    </>
  )
}
