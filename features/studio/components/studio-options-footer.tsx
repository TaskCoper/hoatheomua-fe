'use client'

import { Spinner } from '@/components/ui/spinner'
import { useLoadMoreOnView } from '@/hooks/use-load-more-on-view'
import { useTranslations } from 'next-intl'

interface StudioOptionsFooterProps {
  count: number
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export default function StudioOptionsFooter({
  count,
  loading,
  loadingMore,
  hasMore,
  onLoadMore
}: StudioOptionsFooterProps) {
  const t = useTranslations('studio.options')

  const sentinelRef = useLoadMoreOnView({ enabled: hasMore && !loading && !loadingMore, onLoadMore })

  if (loading) return null
  if (count === 0) return <p className='text-[0.625rem] font-medium text-muted-foreground'>{t('empty')}</p>
  if (!hasMore) return null

  return (
    <div ref={sentinelRef} className='flex h-5 items-center justify-center'>
      {loadingMore ? <Spinner className='size-4 text-muted-foreground' /> : null}
    </div>
  )
}
