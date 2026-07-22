'use client'

import { Button } from '@/components/ui/button'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import type { ContactConfigItem } from '@/types/config.type'
import { ArrowRight02Icon, Mail01Icon, PhoneCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { SERVICE_DETAILS, type ServiceDetailConfig, type ServiceSection } from '../_content'
import { petalCard } from './editorial'
import ServiceToc from './service-toc'

type Props = {
  config: ServiceDetailConfig
  sections: ServiceSection[]
}

export default function ServiceSidebar({ config, sections }: Props) {
  const { t } = useTranslation()
  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const phone = contactConfigs.find((item) => item.key === 'contact.phone')?.value.value
  const email = contactConfigs.find((item) => item.key === 'contact.email')?.value.value

  const siblings = Object.values(SERVICE_DETAILS).filter((s) => s.slug !== config.slug)

  return (
    <aside className='hidden lg:block'>
      <div className='sticky top-24 flex flex-col gap-5'>
        {/* Table of contents */}
        <div className={cn(petalCard, 'p-5')}>
          <ServiceToc sections={sections} />
        </div>

        {/* Related services */}
        <div className={cn(petalCard, 'p-5')}>
          <p className='relative mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary/70'>
            {t('b2b.serviceDetails.common.sidebarRelatedTitle')}
          </p>
          <ul className='space-y-0.5'>
            {siblings.map((sibling) => (
              <li key={sibling.slug}>
                <Link
                  href={`/b2b/${sibling.slug}`}
                  className='group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/30'
                >
                  <HugeiconsIcon
                    icon={sibling.icon}
                    className={cn('size-4 shrink-0', sibling.accent === 'leaf' ? 'text-leaf' : 'text-primary/60')}
                  />

                  <span className='flex-1 text-sm font-medium leading-tight text-foreground group-hover:text-primary'>
                    {t(sibling.cardNameKey as I18nKey)}
                  </span>

                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    className='size-4 shrink-0 text-primary/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary'
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact CTA */}
        <div className='relative overflow-hidden rounded-[1.5rem] rounded-tl-[0.4375rem] bg-gradient-to-br from-primary via-primary to-primary/85 p-5 text-primary-foreground shadow-lg shadow-primary/20'>
          <p className='relative mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground/70'>
            {t('b2b.serviceDetails.common.sidebarContactTitle')}
          </p>

          <div className='relative mb-4 space-y-2 text-sm'>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className='flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground'
              >
                <HugeiconsIcon icon={PhoneCheckIcon} className='size-4 shrink-0' />
                {phone}
              </a>
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                className='flex items-center gap-2 break-all text-primary-foreground/90 hover:text-primary-foreground'
              >
                <HugeiconsIcon icon={Mail01Icon} className='size-4 shrink-0' />
                {email}
              </a>
            ) : null}
          </div>

          <Button asChild size='sm' variant='secondary' className='w-full'>
            <Link href='/contact'>
              {t('b2b.serviceDetails.common.primaryCta')}
              <HugeiconsIcon icon={ArrowRight02Icon} />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  )
}
