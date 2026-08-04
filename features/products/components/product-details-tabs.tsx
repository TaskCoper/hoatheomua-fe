import ProductDetailsTabsShell, { type TabKey } from '@/features/products/components/product-details-tabs-shell'
import {
  ArrowUpRight01Icon,
  DropletIcon,
  MusicNote01Icon,
  Scissor01Icon,
  Sun03Icon,
  ThermometerIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

type TabLabelKey =
  | 'products.detail.tabs.description'
  | 'products.detail.tabs.specs'
  | 'products.detail.tabs.care'
  | 'products.detail.tabs.landing'

const BASE_TABS: { key: Exclude<TabKey, 'landing'>; labelKey: TabLabelKey }[] = [
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

type ShippingDimensions = {
  width: number | null
  height: number | null
  length: number | null
  weight: number | null
}

const formatDimension = (shipping: ShippingDimensions | null | undefined) => {
  if (!shipping) return null
  const { width, height, length } = shipping
  if (!width && !height && !length) return null
  return `${length || '-'} × ${width || '-'} × ${height || '-'} cm`
}

const formatWeight = (weight: number | null | undefined) => {
  if (!weight) return null
  if (weight >= 1000) return `${(weight / 1000).toFixed(2)} kg`
  return `${weight} g`
}

export default async function ProductDetailsTabs({
  code,
  brand,
  type,
  category,
  country,
  shipping,
  landingUrl
}: {
  code: string | null
  brand: string | null
  type: string | null
  category: string | null
  country: string | null
  shipping: ShippingDimensions | null
  landingUrl: string | null
}) {
  const t = await getTranslations()

  const tabs = (
    landingUrl
      ? [...BASE_TABS, { key: 'landing' as const, labelKey: 'products.detail.tabs.landing' as const }]
      : BASE_TABS
  ).map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))

  const specs: SpecRow[] = []
  if (code) specs.push({ label: t('products.detail.tabs.specRows.code'), value: code })
  if (brand) specs.push({ label: t('products.detail.tabs.specRows.brand'), value: brand })
  if (category) specs.push({ label: t('products.detail.tabs.specRows.category'), value: category })
  if (type) specs.push({ label: t('products.detail.tabs.specRows.type'), value: type })
  if (country) specs.push({ label: t('products.detail.tabs.specRows.country'), value: country })
  const dim = formatDimension(shipping)
  if (dim) specs.push({ label: t('products.detail.tabs.specRows.dimensions'), value: dim })
  const weight = formatWeight(shipping?.weight)
  if (weight) specs.push({ label: t('products.detail.tabs.specRows.weight'), value: weight })

  const panels: Partial<Record<TabKey, ReactNode>> = {
    description: (
      <p className='text-sm text-muted-foreground p-4 bg-white/50 rounded-3xl'>
        {t('products.detail.tabs.noDescription')}
      </p>
    ),
    specs:
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
      ),
    care: (
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
    )
  }

  if (landingUrl) {
    panels.landing = (
      <a
        href={landingUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='group flex items-center gap-4 rounded-2xl bg-card pl-2 pr-4 py-2 ring-1 ring-foreground/5 transition-colors hover:ring-primary/20'
      >
        <span className='grid size-12 shrink-0 place-items-center rounded-xl bg-secondary/60 text-primary ring-1 ring-primary/10'>
          <HugeiconsIcon icon={MusicNote01Icon} className='size-6' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='font-title text-sm font-bold text-primary'>{t('products.detail.tabs.landingTitle')}</p>
          <p className='truncate text-xs text-muted-foreground'>{t('products.detail.tabs.visitLanding')}</p>
        </div>
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          className='size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary'
        />
      </a>
    )
  }

  return <ProductDetailsTabsShell ariaLabel={t('products.detail.tabs.ariaLabel')} tabs={tabs} panels={panels} />
}
