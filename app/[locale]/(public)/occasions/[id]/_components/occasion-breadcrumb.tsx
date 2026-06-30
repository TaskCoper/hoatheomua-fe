'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import type { OccasionCard } from '@/types/config.type'
import { ArrowLeft02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function OccasionBreadcrumb({ card }: { card: OccasionCard }) {
  const { t, locale } = useTranslation()
  const name = card.name[locale]

  return (
    <nav
      aria-label={t('products.occasions.detail.breadcrumb.ariaLabel')}
      className='mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-3xl bg-card/70 px-4 py-3 ring-1 ring-foreground/5 backdrop-blur-sm'
    >
      <ol className='flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
        <li>
          <Link href='/' className='transition-colors hover:text-primary'>
            {t('products.occasions.detail.breadcrumb.home')}
          </Link>
        </li>
        <li aria-hidden='true' className='text-foreground/40'>
          <HugeiconsIcon icon={ArrowRight01Icon} className='size-3' />
        </li>
        <li>
          <Link href='/products#occasion' className='transition-colors hover:text-primary'>
            {t('products.occasions.detail.breadcrumb.occasions')}
          </Link>
        </li>
        <li aria-hidden='true' className='text-foreground/40'>
          <HugeiconsIcon icon={ArrowRight01Icon} className='size-3' />
        </li>
        <li className='min-w-0'>
          <span className='line-clamp-1 font-semibold text-primary'>{name}</span>
        </li>
      </ol>

      <Button asChild variant='ghost' size='sm' className='shrink-0 rounded-full'>
        <Link href='/products#occasion'>
          <HugeiconsIcon icon={ArrowLeft02Icon} className='size-4' />
          <span className='hidden sm:inline'>{t('products.occasions.detail.breadcrumb.back')}</span>
        </Link>
      </Button>
    </nav>
  )
}
