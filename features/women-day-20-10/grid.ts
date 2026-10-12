import type { Category } from '@/features/categories/types'
import { getCategoryGrid, parseCategoryMetadata } from '@/features/categories/utils'

export type WomenDayGrid = { cols: number; pageSize: number }

// The collection grid is configured on the campaign category itself (`rows` × `cols` in
// its metadata), exactly like the sections on /products. The page prefetch and the client
// grid both take this one result, so they request the same `pageSize` and the prefetched
// products hydrate instead of refetching. No category (fetch failed) or no grid configured
// falls back to the shared 1 × 4 default.
export const getWomenDayGrid = (category: Pick<Category, 'metaData'> | null): WomenDayGrid => {
  const { cols, pageSize } = getCategoryGrid(parseCategoryMetadata(category?.metaData ?? null))

  return { cols, pageSize }
}
