import { Skeleton } from '@/components/ui/skeleton'
import ProductGridSkeleton from '@/features/products/components/product-grid-skeleton'

/**
 * Streamed via `loading.tsx` while the home page renders on demand (the long tail
 * that isn't prebuilt). Mirrors the hero aspect ratio + a couple of product
 * sections so the shell paints instantly instead of a blank 5s wait.
 */
export default function HomeSkeleton() {
  return (
    <div>
      <Skeleton className='aspect-3/2 w-full rounded-none sm:aspect-2/1 lg:aspect-[64/27]' />
      <div className='mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
        {Array.from({ length: 2 }).map((_, idx) => (
          <section key={idx} className='mb-12'>
            <Skeleton className='mb-6 h-7 w-56 rounded-md' />
            <ProductGridSkeleton count={8} />
          </section>
        ))}
      </div>
    </div>
  )
}
