'use client'

import { useGetCompanyAddress } from '@/hooks/use-get-company-address'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { ContactConfigItem } from '@/types/config.type'
import { InstagramIcon, Location01Icon, Mail01Icon, PhoneCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function ContactLinks() {
  const { t } = useTranslation()
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const { companyAddress } = useGetCompanyAddress()

  const instagram = contactConfigs.find((c) => c.key === 'contact.instagram')
  const email = contactConfigs.find((c) => c.key === 'contact.email')
  const phone = contactConfigs.find((c) => c.key === 'contact.phone')

  const instagramUrl = instagram?.value.value
  const instagramUsername = instagramUrl
    ? (() => {
        try {
          const path = new URL(instagramUrl).pathname.replace(/^\/+|\/+$/g, '').split('/')[0]
          return path ? `@${path}` : ''
        } catch {
          return ''
        }
      })()
    : ''

  const fullAddress = companyAddress?.addressLine
    ? `${companyAddress.addressLine}, ${companyAddress.ward}, ${companyAddress.city}, ${companyAddress.country}`
    : ''
  const hasCoordinates = Number.isFinite(companyAddress?.latitude) && Number.isFinite(companyAddress?.longitude)
  const mapQuery = hasCoordinates ? `${companyAddress?.latitude},${companyAddress?.longitude}` : fullAddress
  const addressHref = mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}` : '#'

  const links = [
    {
      icon: InstagramIcon,
      label: t('contact.links.instagram'),
      value: instagramUsername,
      href: instagramUrl || '#'
    },
    {
      icon: Mail01Icon,
      label: t('contact.links.email'),
      value: email?.value.value ?? '',
      href: email?.value.value ? `mailto:${email.value.value}` : '#'
    },
    {
      icon: PhoneCheckIcon,
      label: t('contact.links.phone'),
      value: phone?.value.value ?? '',
      href: phone?.value.value ? `tel:${phone.value.value}` : '#'
    },
    {
      icon: Location01Icon,
      label: t('contact.links.address'),
      value: companyAddress?.city,
      href: addressHref
    }
  ]

  return (
    <div className='grid gap-2.5 sm:grid-cols-2 md:max-lg:mx-auto md:max-lg:w-full md:max-lg:max-w-[540px] lg:grid-cols-1 xl:grid-cols-2'>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith('http') ? '_blank' : undefined}
          rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className='flex min-h-14 min-w-0 items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/25 px-3.5 py-2.5 text-foreground shadow-[0_0.35rem_1rem_rgb(81_108_108_/_5%)] transition-colors hover:bg-secondary/35'
        >
          <span className='grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground'>
            <HugeiconsIcon icon={link.icon} strokeWidth={2} className='size-4' />
          </span>

          <span className='min-w-0'>
            <span className='block text-[0.625rem] font-medium text-muted-foreground'>{link.label}</span>
            <span className='block truncate text-xs font-semibold text-primary'>{link.value}</span>
          </span>
        </a>
      ))}
    </div>
  )
}
