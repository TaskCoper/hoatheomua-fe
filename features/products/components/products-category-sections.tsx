'use client'

import { useGetCategories } from '@/features/categories/hooks/use-get-categories'
import { CategoryProductPage } from '@/features/categories/types'
import CategoryFilterSection from '@/features/products/components/category-filter-section'
import CategorySectionDefault from '@/features/products/components/category-section-default'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'
import { Suspense } from 'react'

export default function ProductsCategorySections() {
  const { categories, isGettingCategories } = useGetCategories({ page: [CategoryProductPage.Products] })

  if (isGettingCategories && !categories) {
    return (
      <div className='px-4'>
        <div className='mx-auto w-full max-w-7xl'>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    )
  }

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
