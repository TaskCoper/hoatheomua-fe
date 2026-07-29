'use client'

import type { SortableCategory } from '@/features/categories/types'
import { getCategoryDescription, getCategoryName, parseCategoryMetadata } from '@/features/categories/utils'
import CategoryFilterPanel, { type FilterChild } from '@/features/products/components/category-filter-panel'
import ProductGrid from '@/features/products/components/product-grid'
import { PRICE_MAX } from '@/features/products/constants'
import { useGetMaxPriceProduct } from '@/features/products/hooks/use-get-max-price-product'
import { buildSectionUrlKeys, sectionSearchParsers } from '@/features/products/section-search-params'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { motion, type Variants } from 'motion/react'
import { useQueryStates } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function CategoryFilterSection({ category }: { category: SortableCategory }) {
  const { locale } = useTranslation()

  const meta = useMemo(() => parseCategoryMetadata(category.metaData), [category.metaData])
  const filterableChildren = useMemo<FilterChild[]>(() => {
    // Recurse the category tree so nested facets (up to 3+ levels) are preserved,
    // keeping only nodes flagged as filterable at each level.
    const build = (cats: SortableCategory[]): FilterChild[] =>
      cats
        .filter((child) => parseCategoryMetadata(child.metaData).isFilterable)
        .map((child) => ({
          categoryId: child.categoryId,
          label: getCategoryName(child, locale),
          children: build(child.children)
        }))
    return build(category.children)
  }, [category.children, locale])

  const showName = Boolean(meta.filterByName)
  const showPrice = Boolean(meta.filterByPrice)
  const hasFilters = showName || showPrice || filterableChildren.length > 0

  const urlKeys = useMemo(() => buildSectionUrlKeys(category.categoryId), [category.categoryId])
  const [search, setSearch] = useQueryStates(sectionSearchParsers, { urlKeys })

  // Selected category facets drive the listing; with none selected we fall back to
  // every filterable child (or the parent category when there are no child facets).
  const baseCategoryIds =
    filterableChildren.length > 0 ? filterableChildren.map((child) => child.categoryId) : [category.categoryId]
  const effectiveCategoryIds = search.cats.length > 0 ? search.cats : baseCategoryIds

  const { maxPrice } = useGetMaxPriceProduct({ categoryIds: effectiveCategoryIds, enabled: showPrice })
  const priceCeil = maxPrice && maxPrice > 0 ? maxPrice : PRICE_MAX

  // Name draft → debounced → URL (resetting to the first page on change).
  const [nameDraft, setNameDraft] = useState(search.q)
  const [debouncedName] = useDebounce(nameDraft, 300)

  useEffect(() => {
    const next = debouncedName.trim()
    if (next === search.q) return
    setSearch({ q: next.length > 0 ? next : null, page: DEFAULT_PAGE_INDEX })
  }, [debouncedName, search.q, setSearch])

  // Price draft is derived from the URL + the loaded max; re-sync when either changes.
  const derivedPrice = useMemo<[number, number]>(
    () => [search.pmin ?? 0, search.pmax ?? priceCeil],
    [search.pmin, search.pmax, priceCeil]
  )
  const [priceDraft, setPriceDraft] = useState<[number, number]>(derivedPrice)
  const [priceSource, setPriceSource] = useState<[number, number]>(derivedPrice)
  if (priceSource[0] !== derivedPrice[0] || priceSource[1] !== derivedPrice[1]) {
    setPriceSource(derivedPrice)
    setPriceDraft(derivedPrice)
  }

  const handlePriceCommit = (value: [number, number]) => {
    const isFullRange = value[0] <= 0 && value[1] >= priceCeil
    setSearch({
      pmin: isFullRange ? null : value[0],
      pmax: isFullRange ? null : value[1],
      page: DEFAULT_PAGE_INDEX
    })
  }

  const handleCatsChange = (next: string[]) => {
    setSearch({ cats: next.length > 0 ? next : null, page: DEFAULT_PAGE_INDEX })
  }

  const handleReset = () => {
    setSearch({ q: null, pmin: null, pmax: null, cats: null, page: DEFAULT_PAGE_INDEX })
    setNameDraft('')
    setPriceDraft([0, priceCeil])
  }

  const hasActiveFilters =
    search.q.trim() !== '' || search.pmin !== null || search.pmax !== null || search.cats.length > 0

  const title = getCategoryName(category, locale)
  const description = getCategoryDescription(category, locale)

  const grid = (
    <ProductGrid
      className='w-full'
      columnsClassName={
        hasFilters ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }
      pageSize={hasFilters ? 9 : 4}
      categoryIds={effectiveCategoryIds}
      search={search.q}
      priceFrom={search.pmin ?? undefined}
      priceTo={search.pmax ?? undefined}
      page={search.page}
      onPageChange={(page) => setSearch({ page })}
    />
  )

  return (
    <section className='relative mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl'
      >
        <div className='flex items-center justify-start gap-3 sm:justify-center'>
          <SparkleDivider
            className='hidden min-w-0 max-w-96 flex-1 sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />
          <h2 className='shrink-0 text-center font-title text-2xl font-bold md:text-3xl lg:text-4xl'>{title}</h2>
          <SparkleDivider
            className='hidden min-w-0 max-w-96 flex-1 sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        {description && (
          <p className='mx-auto mt-2 max-w-full text-left text-xs leading-relaxed text-foreground sm:max-w-140 sm:text-center sm:text-sm md:max-w-200'>
            {description}
          </p>
        )}
      </motion.div>

      <div className='mx-auto mt-6 w-full max-w-7xl'>
        {hasFilters ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            <CategoryFilterPanel
              className='lg:col-span-3'
              orientation='vertical'
              sectionId={category.categoryId}
              hasActiveFilters={hasActiveFilters}
              onReset={handleReset}
              showName={showName}
              nameValue={nameDraft}
              onNameChange={setNameDraft}
              showPrice={showPrice}
              priceMax={priceCeil}
              priceValue={priceDraft}
              onPriceChange={setPriceDraft}
              onPriceCommit={handlePriceCommit}
              filterChildren={filterableChildren}
              checkedCats={search.cats}
              onCatsChange={handleCatsChange}
            />
            <div className='min-w-0 lg:col-span-9'>{grid}</div>
          </div>
        ) : (
          grid
        )}
      </div>
    </section>
  )
}
