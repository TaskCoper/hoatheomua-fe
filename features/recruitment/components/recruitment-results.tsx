import RecruitmentDefaultView from '@/features/recruitment/components/recruitment-default-view'
import RecruitmentView from '@/features/recruitment/components/recruitment-view'
import { RECRUITMENT_PAGE_SIZE } from '@/features/recruitment/search-params'
import { getQueryClient } from '@/lib/react-query-client'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { jobsListQuery } from '../queries'
import { getCachedJobs } from '../queries.server'

export default async function RecruitmentResults() {
  const queryClient = getQueryClient()
  const options = jobsListQuery({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: RECRUITMENT_PAGE_SIZE
  })

  try {
    const data = await getCachedJobs({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: RECRUITMENT_PAGE_SIZE
    })
    queryClient.setQueryData(options.queryKey, data)
  } catch (error) {
    console.error('[SSR] recruitment list prefetch failed:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<RecruitmentDefaultView />}>
        <RecruitmentView />
      </Suspense>
    </HydrationBoundary>
  )
}
