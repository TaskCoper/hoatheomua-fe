import 'server-only'

import type { SortableCategory } from '@/features/categories/types'
import { resolveCategoriesByIds } from '@/features/categories/utils'
import type { OccasionSection } from '@/features/occasions/components/occasion-detail-content'
import { PRODUCTS_PAGE_SIZE } from '@/features/products/constants'
import { productsQueryKey } from '@/features/products/hooks/use-get-products'
import { getCachedProducts } from '@/features/products/queries.server'
import { getSectionDefaultParams } from '@/features/products/section-defaults'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import type { QueryClient } from '@tanstack/react-query'

/**
 * Seed the query cache with the first page of products for every detail-page
 * section, under the exact keys the client grids will request. The grids then
 * hydrate from cache - real product HTML lands in the ISR output and no refetch
 * fires for page 1 - while pages 2+ remain client (CSR) fetches.
 *
 * Mirrors the products page prefetch: SKU-prefix sections match
 * `OccasionProductsSection`'s `<ProductGrid categoryIds search={skuPrefix} />`
 * (default `PRODUCTS_PAGE_SIZE`, trimmed search); category sections resolve their
 * ids to categories and use `getSectionDefaultParams` so the params - and thus the
 * `productsQueryKey` - line up with `CategorySectionDefault`.
 */
export async function prefetchDetailSections(
  queryClient: QueryClient,
  categories: SortableCategory[],
  sections: OccasionSection[]
): Promise<void> {
  const seed = async (params: Parameters<typeof getCachedProducts>[0]) => {
    try {
      const products = await getCachedProducts(params)
      queryClient.setQueryData(productsQueryKey(params), products)
    } catch (error) {
      console.error('[SSR] section products prefetch failed:', params, error)
    }
  }

  await Promise.all(
    sections.flatMap((section) => {
      if (section.skuPrefix) {
        return [
          seed({
            pageIndex: DEFAULT_PAGE_INDEX,
            pageSize: PRODUCTS_PAGE_SIZE,
            categoryIds: section.categoryIds,
            search: section.skuPrefix.trim()
          })
        ]
      }

      if (section.categoryIds.length > 0) {
        return resolveCategoriesByIds(categories, section.categoryIds).map((category) =>
          seed(getSectionDefaultParams(category))
        )
      }

      return []
    })
  )
}
