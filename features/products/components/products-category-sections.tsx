import type { SortableCategory } from '@/features/categories/types'
import CategoryFilterSection from '@/features/products/components/category-filter-section'
import CategorySectionDefault from '@/features/products/components/category-section-default'
import { Suspense } from 'react'

export default function ProductsCategorySections({ categories }: { categories: SortableCategory[] }) {
  return (
    <>
      {categories.map((category) => (
        <Suspense key={category.categoryId} fallback={<CategorySectionDefault category={category} />}>
          <CategoryFilterSection category={category} />
        </Suspense>
      ))}
    </>
  )
}
