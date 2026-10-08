'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function WomenDayJumpButton() {
  const { t } = useTranslation()

  return (
    <a
      href='#collection'
      aria-label={t('womenDay.hero.primary')}
      className='fixed bottom-[calc(1.25rem+var(--app-bottom-bar-height))] left-4 z-20 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:-translate-y-1 sm:left-6'
    >
      <HugeiconsIcon icon={ArrowDown01Icon} className='size-5' />
    </a>
  )
}
