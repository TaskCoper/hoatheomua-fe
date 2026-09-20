'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import PreviewImage from '@/shared/components/preview-image'
import { SquareLock02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface OrderCardLockedSpecsProps {
  templateName: string
  templateImageUrl: string
  sizeName: string
}

export default function OrderCardLockedSpecs({ templateName, templateImageUrl, sizeName }: OrderCardLockedSpecsProps) {
  const { t } = useTranslation()

  return (
    <div className='flex items-start gap-3 rounded-2xl bg-secondary/20 p-3 ring-1 ring-foreground/5'>
      <PreviewImage
        src={templateImageUrl || null}
        alt={templateName || t('orders.cards.locked.template')}
        sizes='48px'
        className='aspect-3/4 w-11 shrink-0 rounded-xl ring-1 ring-primary/10'
      />

      <div className='min-w-0 flex-1'>
        <p className='flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground'>
          <HugeiconsIcon icon={SquareLock02Icon} strokeWidth={2} className='size-3.5' />
          {t('orders.cards.locked.heading')}
        </p>

        <p className='mt-1 text-sm font-semibold text-foreground'>
          {[templateName ? t('orders.checkout.cards.templateName', { name: templateName }) : null, sizeName || null]
            .filter(Boolean)
            .join(' · ')}
        </p>

        <p className='mt-1 text-[0.7rem] leading-relaxed text-muted-foreground'>{t('orders.cards.locked.note')}</p>
      </div>
    </div>
  )
}
