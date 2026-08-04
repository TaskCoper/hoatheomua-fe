'use client'

import { useGetCategories } from '@/features/categories/hooks/use-get-categories'
import { resolveCategoriesByIds } from '@/features/categories/utils'
import CategoryFilterSection from '@/features/products/components/category-filter-section'
import CategorySectionDefault from '@/features/products/components/category-section-default'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'
import { Suspense, useMemo } from 'react'

export default function OccasionCategorySections({ categoryIds }: { categoryIds: string[] }) {
  const { categories, isGettingCategories } = useGetCategories()

  const matched = useMemo(() => resolveCategoriesByIds(categories, categoryIds), [categories, categoryIds])

  if (isGettingCategories && categories.length === 0) {
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
      {matched.map((category) => (
        // Mirror the products page: CategoryFilterSection reads the URL (nuqs), so it
        // can't be server-rendered - Next.js shows the nearest Suspense fallback during
        // static prerender. CategorySectionDefault renders the same unfiltered grid from
        // the prefetched cache, so ISR HTML carries real products and the interactive
        // filtered version swaps in once JS loads.
        <Suspense key={category.categoryId} fallback={<CategorySectionDefault category={category} />}>
          <CategoryFilterSection category={category} />
        </Suspense>
      ))}
    </>
  )
}
