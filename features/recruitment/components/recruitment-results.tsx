import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { jobsListQuery } from '../queries'
import { getCachedJobs } from '../queries.server'
import type { JobDescriptionParam } from '../types'
import RecruitmentView from '@/features/recruitment/components/recruitment-view'

export default async function RecruitmentResults({
  locale,
  jobParams
}: {
  locale: Locale
  jobParams: JobDescriptionParam
}) {
  const queryClient = getQueryClient()
  const options = jobsListQuery(jobParams, locale)

  try {
    const data = await getCachedJobs(jobParams, locale)
    queryClient.setQueryData(options.queryKey, data)
  } catch (error) {
    console.error('[SSR] recruitment list prefetch failed:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecruitmentView />
    </HydrationBoundary>
  )
}
