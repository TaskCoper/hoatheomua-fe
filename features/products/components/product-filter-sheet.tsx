'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CategoryFilterPanel, { type FilterChild } from '@/features/products/components/category-filter-panel'
import { useGetProducts } from '@/features/products/hooks/use-get-products'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger
} from '@/shared/components/responsive-dialog'
import { FilterHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export interface ProductFilterSheetProps {
  sectionId: string
  activeFilterCount: number
  onReset: () => void
  showName: boolean
  nameValue: string
  onNameChange: (value: string) => void
  showPrice: boolean
  priceMax: number
  priceValue: [number, number]
  onPriceChange: (value: [number, number]) => void
  onPriceCommit: (value: [number, number]) => void
  filterChildren: FilterChild[]
  checkedCats: string[]
  onCatsChange: (ids: string[]) => void
  resultQuery: {
    categoryIds: string[]
    search: string
    priceFrom?: number
    priceTo?: number
    pageSize: number
  }
}

export default function ProductFilterSheet({
  sectionId,
  activeFilterCount,
  onReset,
  resultQuery,
  ...panelProps
}: ProductFilterSheetProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const trimmedSearch = resultQuery.search.trim()
  const { products, isFetchingProducts } = useGetProducts({
    pageIndex: 1,
    pageSize: resultQuery.pageSize,
    categoryIds: resultQuery.categoryIds,
    search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
    priceFrom: resultQuery.priceFrom,
    priceTo: resultQuery.priceTo
  })

  const totalCount = products?.value?.totalCount ?? 0

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button type='button' variant='outline' size='lg' className='shrink-0 gap-2'>
          <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={1.8} />
          {t('common.ui.filters')}
          {activeFilterCount > 0 ? (
            <Badge className='size-5 justify-center rounded-full p-0 text-[0.625rem] tabular-nums'>
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      </ResponsiveDialogTrigger>

      <ResponsiveDialogContent variant='fullscreen' closeLabel={t('common.button.close')}>
        <ResponsiveDialogHeader className='flex-row items-center justify-between gap-3'>
          <ResponsiveDialogTitle>{t('products.filter.title')}</ResponsiveDialogTitle>
          {activeFilterCount > 0 ? (
            <button
              type='button'
              onClick={onReset}
              className='shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline'
            >
              {t('products.filter.reset')}
            </button>
          ) : null}
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className='[&_label]:min-h-11'>
          <CategoryFilterPanel
            orientation='plain'
            sectionId={`${sectionId}-sheet`}
            hasActiveFilters={activeFilterCount > 0}
            onReset={onReset}
            {...panelProps}
          />
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button type='button' size='lg' className='w-full' onClick={() => setOpen(false)}>
            {isFetchingProducts ? t('products.grid.loading') : t('common.ui.showResults', { count: totalCount })}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
