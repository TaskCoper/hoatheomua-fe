'use client'

import type { SortableCategory } from '@/features/categories/types'
import {
  getCategoryDescription,
  getCategoryGrid,
  getCategoryName,
  getResponsiveGridColumns,
  isCategoryTimeActive,
  parseCategoryMetadata
} from '@/features/categories/utils'
import CategoryFilterPanel, { type FilterChild } from '@/features/products/components/category-filter-panel'
import ProductGrid from '@/features/products/components/product-grid'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { motion, type Variants } from 'motion/react'
import { useMemo } from 'react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export type SectionState = {
  nameValue: string
  priceValue: [number, number]
  priceCeil: number
  checkedCats: string[]
  hasActiveFilters: boolean
  search: string
  page: number
  effectiveCategoryIds: string[]
  priceFrom?: number
  priceTo?: number
}

export type SectionHandlers = {
  onNameChange: (value: string) => void
  onPriceChange: (value: [number, number]) => void
  onPriceCommit: (value: [number, number]) => void
  onCatsChange: (ids: string[]) => void
  onReset: () => void
  onPageChange: (page: number) => void
  /**
   * Builds a real URL for a given page so the grid's pagination links work as
   * anchors (open-in-new-tab, crawlable). Scoped per section by the caller so
   * sibling sections on the same page keep their own params.
   */
  pageHref: (page: number) => string
}

export default function SectionView({
  category,
  state,
  handlers
}: {
  category: SortableCategory
  state: SectionState
  handlers: SectionHandlers
}) {
  const { locale } = useTranslation()

  const meta = useMemo(() => parseCategoryMetadata(category.metaData), [category.metaData])
  const filterableChildren = useMemo<FilterChild[]>(() => {
    // Recurse the category tree so nested facets (up to 3+ levels) are preserved,
    // keeping only nodes flagged as filterable and currently within their
    // startTime/endTime window (unset bounds are unconstrained) at each level.
    const now = new Date()
    const build = (cats: SortableCategory[]): FilterChild[] =>
      cats
        .filter((child) => parseCategoryMetadata(child.metaData).isFilterable && isCategoryTimeActive(child, now))
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

  const { cols, pageSize } = useMemo(() => getCategoryGrid(meta), [meta])
  const gridColumns = useMemo(() => getResponsiveGridColumns(cols), [cols])

  const title = getCategoryName(category, locale)
  const description = getCategoryDescription(category, locale)

  const grid = (
    <ProductGrid
      className='w-full'
      columnsClassName={gridColumns.className}
      columnsStyle={gridColumns.style}
      pageSize={pageSize}
      categoryIds={state.effectiveCategoryIds}
      search={state.search}
      priceFrom={state.priceFrom}
      priceTo={state.priceTo}
      page={state.page}
      onPageChange={handlers.onPageChange}
      pageHref={handlers.pageHref}
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
              hasActiveFilters={state.hasActiveFilters}
              onReset={handlers.onReset}
              showName={showName}
              nameValue={state.nameValue}
              onNameChange={handlers.onNameChange}
              showPrice={showPrice}
              priceMax={state.priceCeil}
              priceValue={state.priceValue}
              onPriceChange={handlers.onPriceChange}
              onPriceCommit={handlers.onPriceCommit}
              filterChildren={filterableChildren}
              checkedCats={state.checkedCats}
              onCatsChange={handlers.onCatsChange}
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
