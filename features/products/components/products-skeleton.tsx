import { Skeleton } from '@/components/ui/skeleton'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'

/**
 * Streamed via `loading.tsx` while the products page renders on demand, so the
 * shell paints immediately instead of blocking on the categories + products fetch.
 */
export default function ProductsSkeleton() {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
      {Array.from({ length: 2 }).map((_, idx) => (
        <section key={idx} className='mb-12'>
          <Skeleton className='mb-6 h-7 w-48 rounded-md' />
          <ProductGridSkeleton count={8} />
        </section>
      ))}
    </div>
  )
}
