'use client'

import RecruitmentListView from '@/features/recruitment/components/recruitment-list-view'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import type { RecruitmentFilters } from '../types'

const EMPTY_FILTERS: RecruitmentFilters = { title: '' }
const noop = () => {}

/**
 * The recruitment page frozen on its first page with no filters applied. Next.js
 * renders this on the server in place of the interactive `RecruitmentView`, which
 * can't be server-rendered because it reads the URL. It asks for the very same
 * unfiltered page-1 jobs the route already prefetched, so real job HTML lands in the
 * static page (good for LCP and crawlers). The interactive version swaps in over
 * identical markup on hydration.
 */
export default function RecruitmentDefaultView() {
  return (
    <RecruitmentListView
      filters={EMPTY_FILTERS}
      page={DEFAULT_PAGE_INDEX}
      selectedSlug={null}
      onFilterChange={noop}
      onSearchTitle={noop}
      onResetFilters={noop}
      onPageChange={noop}
      onSelectJob={noop}
    />
  )
}
