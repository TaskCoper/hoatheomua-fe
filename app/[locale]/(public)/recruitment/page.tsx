import type { Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import type { SearchParams } from 'nuqs/server'
import RecruitmentView from './_components/recruitment-view'
import { jobsListQuery } from './queries'
import { buildRecruitmentJsonLd, generateRecruitmentMetadata } from './_seo'
import { loadRecruitmentSearch, toJobDescriptionParam } from './_search-params'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateRecruitmentMetadata(locale)
}

export default async function RecruitmentPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const search = await loadRecruitmentSearch(searchParams)
  const queryClient = getQueryClient()

  try {
    await queryClient.prefetchQuery(jobsListQuery(toJobDescriptionParam(search), locale))
  } catch (error) {
    console.error('[SSR] recruitment list prefetch failed:', error)
  }

  return (
    <>
      <JsonLd data={buildRecruitmentJsonLd(locale)} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RecruitmentView />
      </HydrationBoundary>
    </>
  )
}
