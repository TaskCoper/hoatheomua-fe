'use client'

import type { SortableCategory } from '@/features/categories/types'
import { parseCategoryMetadata } from '@/features/categories/utils'
import SectionView, { type SectionHandlers, type SectionState } from '@/features/products/components/section-view'
import { PRICE_MAX } from '@/features/products/constants'
import { useGetMaxPriceProduct } from '@/features/products/hooks/use-get-max-price-product'
import { getSectionBaseCategoryIds } from '@/features/products/section-defaults'
import { buildSectionUrlKeys, sectionSearchParsers } from '@/features/products/section-search-params'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { useQueryStates } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

export default function CategoryFilterSection({ category }: { category: SortableCategory }) {
  const meta = useMemo(() => parseCategoryMetadata(category.metaData), [category.metaData])
  const showPrice = Boolean(meta.filterByPrice)

  const urlKeys = useMemo(() => buildSectionUrlKeys(category.categoryId), [category.categoryId])
  const [search, setSearch] = useQueryStates(sectionSearchParsers, { urlKeys })

  const baseCategoryIds = getSectionBaseCategoryIds(category)
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

  const state: SectionState = {
    nameValue: nameDraft,
    priceValue: priceDraft,
    priceCeil,
    checkedCats: search.cats,
    hasActiveFilters,
    search: search.q,
    page: search.page,
    effectiveCategoryIds,
    priceFrom: search.pmin ?? undefined,
    priceTo: search.pmax ?? undefined
  }

  const handlers: SectionHandlers = {
    onNameChange: setNameDraft,
    onPriceChange: setPriceDraft,
    onPriceCommit: handlePriceCommit,
    onCatsChange: handleCatsChange,
    onReset: handleReset,
    onPageChange: (page) => setSearch({ page })
  }

  return <SectionView category={category} state={state} handlers={handlers} />
}
