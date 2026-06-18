'use client'

import SanitizedHtml from '@/components/sanitized-html'
import type { ProductShipping } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { DropletIcon, Scissor01Icon, Sun03Icon, ThermometerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'

type TabKey = 'description' | 'specs' | 'care'

const TABS: {
  key: TabKey
  labelKey: 'products.detail.tabs.description' | 'products.detail.tabs.specs' | 'products.detail.tabs.care'
}[] = [
  { key: 'description', labelKey: 'products.detail.tabs.description' },
  { key: 'specs', labelKey: 'products.detail.tabs.specs' },
  { key: 'care', labelKey: 'products.detail.tabs.care' }
]

const CARE_TIPS = [
  {
    icon: Scissor01Icon,
    titleKey: 'products.detail.tabs.careTips.cut.title',
    descriptionKey: 'products.detail.tabs.careTips.cut.description'
  },
  {
    icon: DropletIcon,
    titleKey: 'products.detail.tabs.careTips.water.title',
    descriptionKey: 'products.detail.tabs.careTips.water.description'
  },
  {
    icon: Sun03Icon,
    titleKey: 'products.detail.tabs.careTips.shade.title',
    descriptionKey: 'products.detail.tabs.careTips.shade.description'
  },
  {
    icon: ThermometerIcon,
    titleKey: 'products.detail.tabs.careTips.temperature.title',
    descriptionKey: 'products.detail.tabs.careTips.temperature.description'
  }
] as const

type SpecRow = { label: string; value: string }

const formatDimension = (shipping: ProductShipping | null | undefined) => {
  if (!shipping) return null
  const { width, height, length } = shipping
  if (!width && !height && !length) return null
  return `${length || '—'} × ${width || '—'} × ${height || '—'} cm`
}

const formatWeight = (weight: number | undefined) => {
  if (!weight) return null
  if (weight >= 1000) return `${(weight / 1000).toFixed(2)} kg`
  return `${weight} g`
}

export default function ProductDetailsTabs({
  description,
  content,
  code,
  brand,
  type,
  category,
  country,
  shipping
}: {
  description: string
  content: string
  code: string | null
  brand: string | null
  type: string | null
  category: string | null
  country: string | null
  shipping: ProductShipping | null
}) {
  const { t } = useTranslation()
  const [active, setActive] = useState<TabKey>('description')

  const specs = useMemo<SpecRow[]>(() => {
    const rows: SpecRow[] = []
    if (code) rows.push({ label: t('products.detail.tabs.specRows.code'), value: code })
    if (brand) rows.push({ label: t('products.detail.tabs.specRows.brand'), value: brand })
    if (category) rows.push({ label: t('products.detail.tabs.specRows.category'), value: category })
    if (type) rows.push({ label: t('products.detail.tabs.specRows.type'), value: type })
    if (country) rows.push({ label: t('products.detail.tabs.specRows.country'), value: country })
    const dim = formatDimension(shipping)
    if (dim) rows.push({ label: t('products.detail.tabs.specRows.dimensions'), value: dim })
    const weight = formatWeight(shipping?.weight)
    if (weight) rows.push({ label: t('products.detail.tabs.specRows.weight'), value: weight })
    return rows
  }, [code, brand, category, type, country, shipping, t])

  const hasDescription = description.length > 0 || content.length > 0

  return (
    <div className='mt-8'>
      <div
        role='tablist'
        aria-label={t('products.detail.tabs.ariaLabel')}
        className='flex flex-wrap gap-1 border-b border-border'
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key

          return (
            <button
              key={tab.key}
              type='button'
              role='tab'
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className='relative px-4 py-3 text-sm font-semibold transition-colors'
              style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              {t(tab.labelKey)}
              {isActive ? (
                <motion.span
                  layoutId='product-tab-underline'
                  className='absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary'
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <div role='tabpanel' className='pt-6'>
        {active === 'description' ? (
          hasDescription ? (
            <div className='space-y-4'>
              {description ? <SanitizedHtml html={description} /> : null}
              {content ? <SanitizedHtml html={content} /> : null}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>{t('products.detail.tabs.noDescription')}</p>
          )
        ) : null}

        {active === 'specs' ? (
          specs.length > 0 ? (
            <dl className='overflow-hidden rounded-2xl ring-1 ring-foreground/5'>
              {specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`grid grid-cols-[10rem_1fr] gap-4 px-4 py-3 text-sm ${
                    index % 2 === 0 ? 'bg-card' : 'bg-secondary/20'
                  }`}
                >
                  <dt className='text-xs font-medium text-muted-foreground'>{spec.label}</dt>
                  <dd className='font-medium text-xs text-primary truncate'>{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className='text-sm text-muted-foreground'>{t('products.detail.tabs.noSpecs')}</p>
          )
        ) : null}

        {active === 'care' ? (
          <div className='grid gap-3'>
            {CARE_TIPS.map((tip) => (
              <div key={tip.titleKey} className='flex gap-2 rounded-2xl bg-card p-2 ring-1 ring-foreground/5'>
                <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/60 text-primary ring-1 ring-primary/10'>
                  <HugeiconsIcon icon={tip.icon} className='size-5' />
                </span>
                <div>
                  <p className='font-title text-sm font-bold text-primary'>{t(tip.titleKey)}</p>
                  <p className='text-xs text-foreground'>{t(tip.descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
