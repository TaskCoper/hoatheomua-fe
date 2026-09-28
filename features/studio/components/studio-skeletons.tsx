'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function StudioOptionSkeletons({ count, className }: { count: number; className: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={className} />
      ))}
    </>
  )
}
