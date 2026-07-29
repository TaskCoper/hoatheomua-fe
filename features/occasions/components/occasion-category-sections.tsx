'use client'

import { useGetCategories } from '@/features/categories/hooks/use-get-categories'
import type { SortableCategory } from '@/features/categories/types'
import CategoryFilterSection from '@/features/products/components/category-filter-section'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'
import { useMemo } from 'react'

export default function OccasionCategorySections({ categoryIds }: { categoryIds: string[] }) {
  const { categories, isGettingCategories } = useGetCategories()

  const matched = useMemo(() => {
    // Flatten the category tree so nested children are matchable, not just roots.
    const byId = new Map<string, SortableCategory>()
    const index = (list: SortableCategory[]) => {
      for (const category of list) {
        byId.set(category.categoryId, category)
        if (category.children.length > 0) index(category.children)
      }
    }
    index(categories)

    return categoryIds.map((id) => byId.get(id)).filter((category): category is SortableCategory => Boolean(category))
  }, [categories, categoryIds])

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
        <CategoryFilterSection key={category.categoryId} category={category} />
      ))}
    </>
  )
}
