'use client'

import type { ServiceSection } from '@/features/b2b/service/content'
import { useScrollSpy } from '@/features/b2b/service/hooks/use-scroll-spy'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'

export default function ServiceToc({ sections }: { sections: ServiceSection[] }) {
  const { t } = useTranslation()
  const activeId = useScrollSpy(sections.map((s) => s.id))

  return (
    <nav aria-label={t('b2b.serviceDetails.common.tocTitle')}>
      <p className='mb-3 text-xs font-semibold text-primary/60'>{t('b2b.serviceDetails.common.tocTitle')}</p>
      <ul className='space-y-0.5'>
        {sections.map((section) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg py-1.5 pl-3 pr-2 text-sm transition-all',
                  isActive
                    ? 'bg-secondary/30 font-semibold text-primary'
                    : 'text-muted-foreground hover:translate-x-0.5 hover:text-primary'
                )}
              >
                <span
                  aria-hidden='true'
                  className={cn(
                    'h-4 w-0.5 shrink-0 rounded-full transition-all',
                    isActive ? 'bg-leaf' : 'bg-transparent group-hover:bg-leaf/40'
                  )}
                />
                {t(section.tocLabelKey)}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
