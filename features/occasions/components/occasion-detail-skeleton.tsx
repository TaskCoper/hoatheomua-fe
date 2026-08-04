import { Skeleton } from '@/components/ui/skeleton'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'

/**
 * Streamed via `loading.tsx` for the occasions/featured/mainline detail routes
 * while an id that isn't prebuilt renders on demand — a hero block plus one
 * product section so the page shell is instant instead of a blank wait.
 */
export default function OccasionDetailSkeleton() {
  return (
    <div>
      <Skeleton className='aspect-[21/9] w-full rounded-none' />
      <div className='mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
        <Skeleton className='mb-6 h-7 w-56 rounded-md' />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
