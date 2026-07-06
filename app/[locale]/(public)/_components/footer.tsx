'use client'

import { useGetCompanyAddress } from '@/hooks/use-get-company-address'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useLocale, useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import logo from '@/public/images/logo.png'
import {
  CompanyConfigItem,
  ContactConfigItem,
  FeaturedCollection,
  FeaturedCollectionConfigItem
} from '@/types/config.type'
import { Facebook01Icon, InstagramIcon, Mail01Icon, MessageMultiple01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useMemo } from 'react'

const POLICIES = [
  { labelKey: 'footer.policies.terms', href: '/terms' },
  { labelKey: 'footer.policies.returns', href: '/returns' },
  { labelKey: 'footer.policies.ordering', href: '/ordering' },
  { labelKey: 'footer.policies.privacy', href: '/privacy' },
  { labelKey: 'footer.policies.delivery', href: '/delivery' }
] as const

export default function Footer() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { configs: companyConfigs } = useGetPublicConfigs<CompanyConfigItem>({ group: 'company' })
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const { configs: featuredProductConfigs } = useGetPublicConfigs<FeaturedCollectionConfigItem>({
    group: 'products',
    key: 'products.featured'
  })

  const { companyAddress } = useGetCompanyAddress()

  const companyInfo = companyConfigs.find((c) => c.key === 'company.info')
  const website = companyConfigs.find((c) => c.key === 'company.website')
  const businessId = companyConfigs.find((c) => c.key === 'company.gpkd')
  const hotlines = companyConfigs.find((c) => c.key === 'company.hotlines')
  const director = companyConfigs.find((c) => c.key === 'company.director')

  const facebook = contactConfigs.find((c) => c.key === 'contact.facebook')
  const instagram = contactConfigs.find((c) => c.key === 'contact.instagram')
  const phone = contactConfigs.find((c) => c.key === 'contact.phone')
  const email = contactConfigs.find((c) => c.key === 'contact.email')

  const featuredConfig = featuredProductConfigs.find((c) => c.key === 'products.featured')
  const featuredCards = useMemo(() => {
    const raw = featuredConfig?.value.value
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw) as FeaturedCollection
      return parsed.cards.filter((card) => card.enabled)
    } catch {
      return []
    }
  }, [featuredConfig])

  const SOCIALS = useMemo(() => {
    return [
      { icon: Facebook01Icon, label: 'Facebook', href: facebook?.value.value || '#' },
      { icon: Mail01Icon, label: 'Email', href: email?.value.value ? `mailto:${email?.value.value}` : '#' },
      { icon: MessageMultiple01Icon, label: 'Phone', href: phone?.value.value ? `sms:${phone?.value.value}` : '#' },
      { icon: InstagramIcon, label: 'Instagram', href: instagram?.value.value || '#' }
    ]
  }, [facebook, instagram, phone, email])

  const fullAddress = companyAddress?.addressLine
    ? `${companyAddress.addressLine}, ${companyAddress.ward}, ${companyAddress.city}, ${companyAddress.country}`
    : ''
  const hasCoordinates = Number.isFinite(companyAddress?.latitude) && Number.isFinite(companyAddress?.longitude)
  const mapQuery = hasCoordinates ? `${companyAddress?.latitude},${companyAddress?.longitude}` : fullAddress
  const googleMapSrc = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : undefined

  return (
    <footer className='bg-background space-y-6 sm:space-y-8'>
      <div className='mx-auto w-full max-w-7xl px-4 pt-6 sm:pt-8 lg:pt-10 xl:px-0'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6'>
          <div className='space-y-2 lg:col-span-4'>
            <Image src={logo} alt={t('footer.logoAlt')} className='h-24 w-auto sm:h-28 lg:h-32' />
            <p className='text-base sm:text-lg font-bold'>{t('footer.company')}</p>
            <div className='space-y-2 text-xs sm:text-sm leading-relaxed text-foreground'>
              <p>
                <span className='font-semibold'>{companyInfo?.value.value}</span>
                {companyInfo?.value.description && ` - ${companyInfo.value.description}`}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.addressLabel')}</span> {fullAddress}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.hotlineLabel')}</span>{' '}
                {hotlines?.value.options.map((o) => o.value).join(' - ')}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.directorLabel')}</span> {director?.value.value}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.websiteLabel')}</span> {website?.value.value}
              </p>
              <p>
                <span className='font-semibold'>{t('footer.businessIdLabel')}</span> {businessId?.value.value}
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
              {featuredCards.map((card) => (
                <li key={card.id} className='flex items-center gap-2'>
                  <span className='inline-block size-1.5 shrink-0 rounded-full bg-primary' aria-hidden='true' />
                  <Link href={`/featured/${card.id}`} className='transition-colors hover:text-primary'>
                    {card.name[locale] || card.name.vi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='space-y-2 lg:col-span-3'>
            <h2 className='text-sm sm:text-base font-bold text-primary'>{t('footer.mapHeading')}</h2>
            <div className='overflow-hidden rounded-2xl border-2 border-secondary/80 shadow-md'>
              {googleMapSrc && (
                <iframe
                  src={googleMapSrc}
                  title={t('footer.mapTitle')}
                  className='h-40 w-full sm:h-48 lg:h-44'
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                />
              )}
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
