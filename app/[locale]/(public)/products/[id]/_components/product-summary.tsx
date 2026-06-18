'use client'

import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { DeliveryTruck01Icon, Flower2Icon, HandHeartIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const TRUST_BADGES = [
  { icon: Flower2Icon, labelKey: 'products.summary.trustBadges.fresh' },
  { icon: HandHeartIcon, labelKey: 'products.summary.trustBadges.handmade' },
  { icon: DeliveryTruck01Icon, labelKey: 'products.summary.trustBadges.delivery' }
] as const

export default function ProductSummary({
  name,
  brand,
  type,
  available
}: {
  name: string
  brand: string | null
  type: string | null
  available: number
}) {
  const { t } = useTranslation()
  const inStock = available > 0
  const specs: { label: string; value: string }[] = []

  if (brand) {
    specs.push({ label: t('products.summary.specs.brand'), value: brand })
  }
  if (type) {
    specs.push({ label: t('products.summary.specs.type'), value: type })
  }

  specs.push({
    label: t('products.summary.specs.status'),
    value: inStock ? t('products.summary.specs.inStock') : t('products.summary.specs.outOfStock')
  })

  return (
    <div className='space-y-4'>
      <h1 className='font-title text-3xl font-bold text-primary lg:text-4xl xl:text-5xl'>{name}</h1>

      <div className='flex flex-wrap gap-2'>
        {TRUST_BADGES.map((item) => (
          <Badge
            key={item.labelKey}
            variant='secondary'
            className='gap-1.5 bg-secondary/40 px-2 py-1 text-[0.7rem] font-semibold text-primary ring-1 ring-foreground/5 hover:bg-secondary/40'
          >
            <HugeiconsIcon icon={item.icon} className='size-3.5' />
            {t(item.labelKey)}
          </Badge>
        ))}
      </div>

      <dl className='divide-y divide-border/70 rounded-2xl bg-card ring-1 ring-foreground/5'>
        {specs.map((spec) => (
          <div key={spec.label} className='grid grid-cols-[8rem_1fr] items-center gap-3 px-4 py-3'>
            <dt className='text-xs font-medium text-muted-foreground'>{spec.label}</dt>
            <dd className='font-medium text-xs text-primary'>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
