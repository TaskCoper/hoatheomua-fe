'use client'

import { Spinner } from '@/components/ui/spinner'
import { useTranslations } from 'next-intl'

const loadMoreButtonClass =
  'cursor-pointer rounded-full bg-secondary/60 px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'

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

  if (loading) return <Spinner className='size-4 text-muted-foreground' />
  if (count === 0) return <p className='text-[0.625rem] font-medium text-muted-foreground'>{t('empty')}</p>
  if (!hasMore) return null

  return (
    <button type='button' onClick={onLoadMore} disabled={loadingMore} className={loadMoreButtonClass}>
      {loadingMore ? t('loadingMore') : t('loadMore')}
    </button>
  )
}
