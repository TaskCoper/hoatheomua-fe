import type { SortableCategory } from '@/features/categories/types'
import CategoryFilterSection from '@/features/products/components/category-filter-section'

/**
 * Server component: the category list is fetched by the page and handed down as
 * props, mirroring `ProductsCategorySections` on /products.
 *
 * It used to be a client component that read the categories back out of the
 * React Query cache. That put a `'use client'` boundary above every section on
 * the page, and the home route's prerendered HTML came out with no product
 * content at all - no headings, no cards, nothing for a crawler or for LCP.
 * Reading the same data the page already has, on the server, keeps the sections
 * in the static HTML; only the per-section filter controls stay interactive.
 */
export default function HomeCategorySections({ categories }: { categories: SortableCategory[] }) {
  return (
    <>
      {categories.map((category) => (
        <CategoryFilterSection key={category.categoryId} category={category} />
      ))}
    </>
  )
}
