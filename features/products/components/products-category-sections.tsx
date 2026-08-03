import type { SortableCategory } from '@/features/categories/types'
import CategoryFilterSection from '@/features/products/components/category-filter-section'
import CategorySectionDefault from '@/features/products/components/category-section-default'
import { Suspense } from 'react'

// Server component: the category list is fetched once on the server (see the
// products page) and passed straight down, so no client-side categories query is
// needed. Only the per-section interactive/filterable parts cross into the client.
export default function ProductsCategorySections({ categories }: { categories: SortableCategory[] }) {
  return (
    <>
      {categories.map((category) => (
        // Why wrap each section in Suspense? CategoryFilterSection reads the URL
        // (via nuqs), and Next.js won't server-render anything that reads search
        // params — it shows the nearest Suspense fallback instead. So we hand it a
        // real fallback: CategorySectionDefault renders the same unfiltered grid on
        // the server from data we already prefetched. The upshot is that crawlers
        // and the first paint see actual products, not an empty gap, and the
        // interactive filterable version quietly takes over once JS loads.
        <Suspense key={category.categoryId} fallback={<CategorySectionDefault category={category} />}>
          <CategoryFilterSection category={category} />
        </Suspense>
      ))}
    </>
  )
}
