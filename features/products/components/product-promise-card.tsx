'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { CheckmarkCircle02Icon, Flower2Icon, HandHeartIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const PROMISES = [
  { icon: Flower2Icon, labelKey: 'products.promiseCard.items.fresh' },
  { icon: HandHeartIcon, labelKey: 'products.promiseCard.items.handmade' },
  { icon: CheckmarkCircle02Icon, labelKey: 'products.promiseCard.items.exchange' },
  { icon: Wallet01Icon, labelKey: 'products.promiseCard.items.payment' }
] as const

export default function ProductPromiseCard() {
  const { t } = useTranslation()

  return (
    <div className='space-y-3 rounded-3xl bg-card px-4 py-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'>
      <p className='font-title text-base font-bold text-primary'>{t('products.promiseCard.title')}</p>

      <ul className='space-y-2.5'>
        {PROMISES.map((promise) => (
          <li key={promise.labelKey} className='flex items-center gap-2.5 text-sm text-foreground'>
            <span className='grid size-7 shrink-0 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
              <HugeiconsIcon icon={promise.icon} className='size-3.5' />
            </span>
            <span className='leading-snug'>{t(promise.labelKey)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
