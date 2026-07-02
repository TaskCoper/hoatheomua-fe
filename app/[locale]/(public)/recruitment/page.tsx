import { Spinner } from '@/components/ui/spinner'
import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import type { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'
import RecruitmentResults from './_components/recruitment-results'
import { loadRecruitmentSearch, toJobDescriptionParam } from './_search-params'
import { buildRecruitmentJsonLd, generateRecruitmentMetadata } from './_seo'

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
  const jobParams = toJobDescriptionParam(search)

  return (
    <>
      <JsonLd data={buildRecruitmentJsonLd(locale)} />

      <Suspense
        fallback={
          <div className='grid min-h-[60vh] place-items-center'>
            <Spinner />
          </div>
        }
      >
        <RecruitmentResults locale={locale} jobParams={jobParams} />
      </Suspense>
    </>
  )
}
