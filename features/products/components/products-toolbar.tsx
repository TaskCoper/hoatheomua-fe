'use client'

import { Input } from '@/components/ui/input'
import ProductFilterSheet, { type ProductFilterSheetProps } from '@/features/products/components/product-filter-sheet'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function ProductsToolbar({
  showSearch,
  searchValue,
  onSearchChange,
  ...sheetProps
}: ProductFilterSheetProps & {
  showSearch: boolean
  searchValue: string
  onSearchChange: (value: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div className='top-below-header sticky z-20 -mx-4 mb-4 bg-background/85 px-4 py-2 supports-backdrop-filter:backdrop-blur-md lg:hidden'>
      <div className='flex items-center gap-2'>
        {showSearch ? (
          <div className='relative min-w-0 flex-1'>
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={1.8}
              className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              type='search'
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('products.filter.searchPlaceholder')}
              aria-label={t('products.filter.search')}
              enterKeyHint='search'
              autoComplete='off'
              className='h-10 rounded-full pl-9'
            />
          </div>
        ) : (
          <span className='flex-1' />
        )}

        <ProductFilterSheet {...sheetProps} />
      </div>
    </div>
  )
}
