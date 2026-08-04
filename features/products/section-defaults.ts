import type { SortableCategory } from '@/features/categories/types'
import { getCategoryGrid, parseCategoryMetadata } from '@/features/categories/utils'
import type { GetProductsParams } from '@/features/products/hooks/use-get-products'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'

// Which categories a section shows products from when no filter is selected. If the
// section has filterable sub-categories, we pull from all of them; otherwise we just
// use the section's own category. This lives here - rather than inline in the section
// component - so the server prefetch and the client arrive at the exact same ids.
export const getSectionBaseCategoryIds = (category: SortableCategory): string[] => {
  const filterableChildren = category.children.filter((child) => parseCategoryMetadata(child.metaData).isFilterable)

  return filterableChildren.length > 0 ? filterableChildren.map((child) => child.categoryId) : [category.categoryId]
}

// The product query a section makes on first load, before any filter is applied.
// Page size isn't fixed - each section configures its own rows × cols grid - so we
// read it from the category metadata. The page prefetches with these exact params,
// letting the grid hydrate from cache instead of firing another request.
export const getSectionDefaultParams = (category: SortableCategory): GetProductsParams => ({
  pageIndex: DEFAULT_PAGE_INDEX,
  pageSize: getCategoryGrid(parseCategoryMetadata(category.metaData)).pageSize,
  categoryIds: getSectionBaseCategoryIds(category)
})
