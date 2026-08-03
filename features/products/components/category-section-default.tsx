'use client'

import type { SortableCategory } from '@/features/categories/types'
import SectionView, { type SectionHandlers, type SectionState } from '@/features/products/components/section-view'
import { PRICE_MAX } from '@/features/products/constants'
import { getSectionBaseCategoryIds } from '@/features/products/section-defaults'
import { buildSectionUrlKeys, sectionSearchParsers } from '@/features/products/section-search-params'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { createSerializer } from 'nuqs'

const noop = () => {}

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

  const serializePage = createSerializer(sectionSearchParsers, { urlKeys: buildSectionUrlKeys(category.categoryId) })

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

  const handlers: SectionHandlers = {
    onNameChange: noop,
    onPriceChange: noop,
    onPriceCommit: noop,
    onCatsChange: noop,
    onReset: noop,
    onPageChange: noop,
    // Scoped page URLs (e.g. `?<catId>_page=2`) so crawlers can follow to page 2+.
    // No base params: this server render has no active filters or sibling state.
    pageHref: (page: number) => serializePage({ page })
  }

  return <SectionView category={category} state={state} handlers={handlers} />
}
