import { Skeleton } from '@/components/ui/skeleton'

export default function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5'>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className='flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/5'>
          <Skeleton className='h-44 rounded-none sm:h-48 lg:h-56' />
          <div className='flex flex-1 flex-col gap-2 p-4 sm:p-3 md:p-4 lg:p-5'>
            <Skeleton className='h-3 w-12 rounded-md' />
            <Skeleton className='h-5 w-3/4 rounded-md' />
            <Skeleton className='h-3 w-full rounded-md' />
            <div className='mt-1 flex items-end justify-between gap-3'>
              <div className='space-y-1'>
                <Skeleton className='h-2 w-10 rounded-md' />
                <Skeleton className='h-4 w-20 rounded-md' />
              </div>
              <Skeleton className='h-9 w-9 rounded-full' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
