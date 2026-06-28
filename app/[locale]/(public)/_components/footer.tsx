'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import logo from '@/public/images/logo.png'
import { Facebook01Icon, InstagramIcon, Mail01Icon, MessageMultiple01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

const POLICIES = [
  { labelKey: 'footer.policies.terms', href: '/terms' },
  { labelKey: 'footer.policies.returns', href: '/returns' },
  { labelKey: 'footer.policies.ordering', href: '/ordering' },
  { labelKey: 'footer.policies.privacy', href: '/privacy' },
  { labelKey: 'footer.policies.delivery', href: '/delivery' }
] as const

const FEATURED_PRODUCTS = [
  'footer.featured.birthday',
  'footer.featured.opening',
  'footer.featured.march8',
  'footer.featured.oct20',
  'footer.featured.nov20',
  'footer.featured.noel',
  'footer.featured.feb27',
  'footer.featured.business',
  'footer.featured.orchid'
] as const

const SOCIALS = [
  { icon: Facebook01Icon, label: 'Facebook', href: '#' },
  { icon: Mail01Icon, label: 'Email', href: '#' },
  { icon: MessageMultiple01Icon, label: 'Zalo', href: '#' },
  { icon: InstagramIcon, label: 'Instagram', href: '#' }
]

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className='bg-background space-y-6 sm:space-y-8'>
      <div className='mx-auto w-full max-w-7xl px-4 pt-6 sm:pt-8 lg:pt-10 xl:px-0'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6'>
          <div className='space-y-2 lg:col-span-4'>
            <Image src={logo} alt={t('footer.logoAlt')} className='h-24 w-auto sm:h-28 lg:h-32' />
            <p className='text-base sm:text-lg font-bold'>{t('footer.company')}</p>
            <div className='space-y-2 text-xs sm:text-sm leading-relaxed text-foreground'>
              <p>
                <span className='font-semibold'>{t('footer.brand')}</span> - {t('footer.description')}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.addressLabel')}</span> {t('footer.address')}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.hotlineLabel')}</span> {t('footer.hotline')}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.directorLabel')}</span> {t('footer.director')}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.websiteLabel')}</span> {t('footer.website')}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.businessIdLabel')}</span> {t('footer.businessId')}
              </p>
            </div>
          </div>

          <div className='space-y-2 lg:col-span-3'>
            <h2 className='text-sm sm:text-base font-bold text-primary'>{t('footer.policiesHeading')}</h2>
            <ul className='space-y-2 text-xs sm:text-sm text-foreground'>
              {POLICIES.map((policy) => (
                <li key={policy.labelKey} className='flex items-center gap-2'>
                  <span className='inline-block size-1.5 shrink-0 rounded-full bg-primary' aria-hidden='true' />
                  <Link href={policy.href} className='transition-colors hover:text-primary'>
                    {t(policy.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='space-y-2 lg:col-span-2'>
            <h2 className='text-sm sm:text-base font-bold text-primary'>{t('footer.featuredHeading')}</h2>
            <ul className='space-y-2 text-xs sm:text-sm text-foreground'>
              {FEATURED_PRODUCTS.map((key) => (
                <li key={key} className='flex items-center gap-2'>
                  <span className='inline-block size-1.5 shrink-0 rounded-full bg-primary' aria-hidden='true' />
                  <a href='#' className='transition-colors hover:text-primary'>
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='space-y-2 lg:col-span-3'>
            <h2 className='text-sm sm:text-base font-bold text-primary'>{t('footer.mapHeading')}</h2>
            <div className='overflow-hidden rounded-2xl border-2 border-secondary/80 shadow-md'>
              <iframe
                src='https://www.google.com/maps?q=13A+Dao+Duy+Anh,+Phu+Nhuan,+Ho+Chi+Minh&output=embed'
                title={t('footer.mapTitle')}
                className='h-40 w-full sm:h-48 lg:h-44'
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
            </div>
            <div className='flex items-center gap-3'>
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className='grid size-9 place-items-center rounded-full border border-foreground text-foreground transition-colors hover:bg-primary hover:text-primary-foreground sm:size-10'
                >
                  <HugeiconsIcon icon={social.icon} className='size-4 sm:size-5' />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='bg-primary py-2 text-background sm:py-3'>
        <p className='mx-auto w-full max-w-7xl px-4 text-center text-xs leading-relaxed sm:text-sm lg:text-left xl:px-0'>
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  )
}
