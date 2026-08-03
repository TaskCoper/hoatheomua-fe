import ScopedIntlProvider from '@/components/scoped-intl-provider'
import { Spinner } from '@/components/ui/spinner'
import RecruitmentResults from '@/features/recruitment/components/recruitment-results'
import { buildRecruitmentJsonLd, generateRecruitmentMetadata } from '@/features/recruitment/seo'
import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateRecruitmentMetadata(locale)
}

export default async function RecruitmentPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <ScopedIntlProvider namespaces={['recruitment', 'richTextEditor', 'careers', 'dataTable']}>
      <JsonLd data={buildRecruitmentJsonLd(locale)} />

      <Suspense
        fallback={
          <div className='grid min-h-[60vh] place-items-center'>
            <Spinner />
          </div>
        }
      >
        <RecruitmentResults locale={locale} />
      </Suspense>
    </ScopedIntlProvider>
  )
}
