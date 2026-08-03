'use client'

import type { SortableCategory } from '@/features/categories/types'
import SectionView, { type SectionHandlers, type SectionState } from '@/features/products/components/section-view'
import { PRICE_MAX } from '@/features/products/constants'
import { getSectionBaseCategoryIds } from '@/features/products/section-defaults'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'

const noop = () => {}

const NOOP_HANDLERS: SectionHandlers = {
  onNameChange: noop,
  onPriceChange: noop,
  onPriceCommit: noop,
  onCatsChange: noop,
  onReset: noop,
  onPageChange: noop
}

/**
 * A product section frozen in its default, unfiltered state. Next.js renders this
 * on the server in place of the interactive `CategoryFilterSection`, which can't be
 * server-rendered because it reads the URL. Because it asks for the very same
 * default products the page already prefetched, the grid fills straight from the
 * cache and real product HTML lands in the static page (good for LCP and crawlers).
 * When the client loads, the interactive version swaps in over identical markup, so
 * there's no visible jump.
 */
export default function CategorySectionDefault({ category }: { category: SortableCategory }) {
  const baseCategoryIds = getSectionBaseCategoryIds(category)

  const state: SectionState = {
    nameValue: '',
    priceValue: [0, PRICE_MAX],
    priceCeil: PRICE_MAX,
    checkedCats: [],
    hasActiveFilters: false,
    search: '',
    page: DEFAULT_PAGE_INDEX,
    effectiveCategoryIds: baseCategoryIds,
    priceFrom: undefined,
    priceTo: undefined
  }

  return <SectionView category={category} state={state} handlers={NOOP_HANDLERS} />
}
