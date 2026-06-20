'use client'

import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  DEFAULT_PRODUCT_CATEGORY_IDS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_RANGES,
  PRICE_STEP,
  PRODUCT_CATEGORIES
} from '@/features/products/constants'
import type { Product } from '@/features/products/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { motion, type Variants } from 'motion/react'
import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { SparkleDivider } from '../../_components/sparkle-dividier'
import ProductGrid from './product-grid'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

type SelectedCategory = 'all' | number
type PriceRange = [number, number]

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})
const formatVnd = (value: number) => vndFormatter.format(value)

const FULL_RANGE: PriceRange = [PRICE_MIN, PRICE_MAX]

export default function ProductsCatalogSection({
  initialItems,
  initialNextCursor
}: {
  initialItems: Product[]
  initialNextCursor: number
}) {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>('all')
  const [nameInput, setNameInput] = useState('')
  const [priceRange, setPriceRange] = useState<PriceRange>(FULL_RANGE)

  const [debouncedName] = useDebounce(nameInput, 300)
  const [debouncedPrice] = useDebounce(priceRange, 300)

  const isAll = selectedCategory === 'all'
  const isFullPrice = debouncedPrice[0] === PRICE_MIN && debouncedPrice[1] === PRICE_MAX
  const hasFilters = !isAll || debouncedName.trim() !== '' || !isFullPrice

  const categoryIds = useMemo(
    () => (isAll ? DEFAULT_PRODUCT_CATEGORY_IDS : [selectedCategory as number]),
    [isAll, selectedCategory]
  )

  const priceParam = useMemo(
    () => (isFullPrice ? undefined : ([debouncedPrice[0], debouncedPrice[1]] as number[])),
    [debouncedPrice, isFullPrice]
  )

  const canUseSsrData = isAll && debouncedName.trim() === '' && isFullPrice
  const gridKey = `${selectedCategory}|${debouncedName.trim()}|${debouncedPrice[0]}-${debouncedPrice[1]}`

  const pillClass = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-foreground/15 bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'
    )

  const handleReset = () => {
    setSelectedCategory('all')
    setNameInput('')
    setPriceRange(FULL_RANGE)
  }

  const handlePriceRangePreset = (min: number, max: number) => {
    setPriceRange([min, max])
  }

  return (
    <section id='all-products' className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('products.catalog.title')}
          </h2>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('products.catalog.description')}
        </p>
      </motion.div>

      <div className='mx-auto mt-6 grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_1fr] lg:gap-8'>
        <motion.aside
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeUp}
          aria-label={t('products.filter.title')}
          className='h-fit rounded-3xl bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-sm lg:sticky lg:top-24'
        >
          <div className='flex items-center justify-between gap-2'>
            <h3 className='font-title text-base font-semibold text-primary'>{t('products.filter.title')}</h3>
            {hasFilters && (
              <button
                type='button'
                onClick={handleReset}
                className='text-xs font-medium text-primary underline-offset-2 hover:underline cursor-pointer'
              >
                {t('products.filter.reset')}
              </button>
            )}
          </div>

          <div className='mt-4 space-y-1.5'>
            <label htmlFor='product-search' className='text-xs font-medium text-foreground'>
              {t('products.filter.search')}
            </label>
            <Input
              id='product-search'
              type='search'
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder={t('products.filter.searchPlaceholder')}
            />
          </div>

          <div className='mt-5 space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-xs font-medium text-foreground'>{t('products.filter.priceHeading')}</span>
              <span className='text-[0.6875rem] text-muted-foreground'>
                {isFullPrice
                  ? t('products.filter.priceAll')
                  : t('products.filter.priceValue', {
                      min: formatVnd(priceRange[0]),
                      max: formatVnd(priceRange[1])
                    })}
              </span>
            </div>
            <Slider
              value={priceRange}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              onValueChange={(next) => {
                if (next.length === 2) setPriceRange([next[0], next[1]])
              }}
              aria-label={t('products.filter.priceHeading')}
            />
            <div className='flex flex-wrap gap-2 pt-1'>
              <button
                type='button'
                onClick={() => setPriceRange(FULL_RANGE)}
                aria-pressed={isFullPrice}
                className={pillClass(isFullPrice)}
              >
                {t('products.filter.all')}
              </button>
              {PRICE_RANGES.map((range) => {
                const active = priceRange[0] === range.min && priceRange[1] === range.max
                return (
                  <button
                    key={`${range.min}-${range.max}`}
                    type='button'
                    onClick={() => handlePriceRangePreset(range.min, range.max)}
                    aria-pressed={active}
                    className={pillClass(active)}
                  >
                    {t(range.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='mt-5 space-y-2'>
            <span className='text-xs font-medium text-foreground'>{t('products.filter.categoriesHeading')}</span>
            <div className='flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => setSelectedCategory('all')}
                aria-pressed={isAll}
                className={pillClass(isAll)}
              >
                {t('products.filter.all')}
              </button>
              {PRODUCT_CATEGORIES.map((category) => {
                const active = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    type='button'
                    onClick={() => setSelectedCategory(category.id)}
                    aria-pressed={active}
                    className={pillClass(active)}
                  >
                    {t(category.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.aside>

        <div className='min-w-0'>
          <ProductGrid
            key={gridKey}
            initialItems={canUseSsrData ? initialItems : []}
            initialNextCursor={canUseSsrData ? initialNextCursor : 0}
            categoryIds={categoryIds}
            name={debouncedName}
            price={priceParam}
          />
        </div>
      </div>
    </section>
  )
}
