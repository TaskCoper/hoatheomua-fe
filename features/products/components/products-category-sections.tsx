'use client'

import { useGetCategories } from '@/features/categories/hooks/use-get-categories'
import CategoryFilterSection from '@/features/products/components/category-filter-section'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'

export default function ProductsCategorySections() {
  const { categories, isGettingCategories } = useGetCategories()

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
        <CategoryFilterSection key={category.categoryId} category={category} />
      ))}
    </>
  )
}
