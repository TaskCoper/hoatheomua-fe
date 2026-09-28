'use client'

import { Badge } from '@/components/ui/badge'
import { availableOf, useProductVariant } from '@/features/products/components/product-variant-context'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
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
  type
}: {
  name: string
  brand: string | null
  type: string | null
}) {
  const { t } = useTranslation()
  // Stock follows the selected variant so the header never says "out of stock"
  // for an in-stock variant (the parent row's own stock is a null placeholder).
  const { selected } = useProductVariant()
  const available = availableOf(selected)
  const inStock = available > 0

  const availabilityLabel = inStock
    ? t('products.summary.specs.inStock', { count: available })
    : t('products.summary.specs.outOfStock')

  const specs: { label: string; value: string }[] = []

  if (brand) {
    specs.push({ label: t('products.summary.specs.brand'), value: brand })
  }
  if (type) {
    specs.push({ label: t('products.summary.specs.type'), value: type })
  }

  specs.push({ label: t('products.summary.specs.status'), value: availabilityLabel })

  return (
    <div className='space-y-4'>
      <h1 className='font-title text-[clamp(1.5rem,6vw,3rem)] leading-tight font-bold text-pretty text-primary'>
        {name}
      </h1>

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

      <p
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold lg:hidden',
          inStock ? 'bg-leaf/12 text-leaf' : 'bg-destructive/10 text-destructive'
        )}
      >
        <span
          aria-hidden='true'
          className={cn('inline-block size-1.5 rounded-full', inStock ? 'bg-leaf' : 'bg-destructive')}
        />
        {availabilityLabel}
      </p>

      <dl className='hidden divide-y divide-border/70 rounded-2xl bg-card ring-1 ring-foreground/5 lg:block'>
        {specs.map((spec) => (
          <div key={spec.label} className='grid grid-cols-[8rem_1fr] items-center gap-3 px-4 py-3'>
            <dt className='text-xs font-medium text-muted-foreground'>{spec.label}</dt>
            <dd className='text-xs font-medium text-primary'>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
