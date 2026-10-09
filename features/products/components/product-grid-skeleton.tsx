import { Skeleton } from '@/components/ui/skeleton'
import { PRODUCT_CARD_MEDIA_HEIGHT } from '@/features/products/constants'
import { cn } from '@/shared/utils'
import type { CSSProperties } from 'react'

export default function ProductGridSkeleton({
  count = 12,
  columnsClassName = '[grid-template-columns:repeat(auto-fill,minmax(min(8.5rem,100%),1fr))] md:grid-cols-3 lg:grid-cols-4',
  style
}: {
  count?: number
  columnsClassName?: string
  style?: CSSProperties
}) {
  return (
    <div className={cn('mx-auto mt-6 grid w-full max-w-7xl gap-3 sm:gap-4 lg:gap-5', columnsClassName)} style={style}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className='flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/5'>
          <Skeleton className={cn('rounded-none', PRODUCT_CARD_MEDIA_HEIGHT)} />
          <div className='flex flex-1 flex-col gap-1.5 p-3 sm:p-4 lg:p-5'>
            <Skeleton className='h-4 w-3/4 rounded-md' />
            <div className='mt-2 space-y-1'>
              <Skeleton className='h-2.5 w-12 rounded-md' />
              <Skeleton className='h-4 w-20 rounded-md' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
