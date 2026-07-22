'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { ReactNode } from 'react'
import type { ServiceDetailConfig, ServiceSection } from '../_content'
import ServiceSidebar from './service-sidebar'

type Props = {
  config: ServiceDetailConfig
  sections: ServiceSection[]
  children: ReactNode
}

/**
 * Editorial two-column shell. The server page renders the ordered section
 * components (each carrying its anchor id) and passes them here as `children`;
 * this client boundary owns the sticky sidebar + scroll-spy behaviour.
 */
export default function ServiceDetailLayout({ config, sections, children }: Props) {
  const { t } = useTranslation()

  return (
    <>
      {/* Mobile quick-nav — horizontal scroll of section anchors */}
      <div className='lg:hidden sticky top-16 z-20 -mx-4 mt-6 border-y border-primary/10 bg-background/90 px-4 py-2.5 backdrop-blur'>
        <div className='profile-scrollbar flex gap-2 overflow-x-auto'>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className='shrink-0 rounded-full rounded-tl-sm border border-primary/15 bg-card/80 px-3.5 py-1 text-xs font-medium text-primary transition-colors hover:border-leaf/40 hover:bg-secondary/40'
            >
              {t(section.tocLabelKey)}
            </a>
          ))}
        </div>
      </div>

      <div className='mx-auto mt-8 grid w-full max-w-7xl gap-8 px-4 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_21rem]'>
        <main className='min-w-0 space-y-8'>{children}</main>
        <ServiceSidebar config={config} sections={sections} />
      </div>
    </>
  )
}
