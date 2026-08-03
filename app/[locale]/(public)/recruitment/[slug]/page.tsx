import ScopedIntlProvider from '@/components/scoped-intl-provider'
import { Button } from '@/components/ui/button'
import JobDetail from '@/features/recruitment/components/job-detail'
import { getAllJobSlugs, getCachedJobDescription } from '@/features/recruitment/queries.server'
import { buildJobPostingJsonLd, generateJobDetailMetadata } from '@/features/recruitment/seo'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/routing'
import { routing } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const revalidate = 600

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllJobSlugs()

  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params

  let job: Awaited<ReturnType<typeof getCachedJobDescription>> | null = null
  try {
    job = await getCachedJobDescription(slug)
  } catch (error) {
    console.error('[SSR] job detail metadata fetch failed:', error)
    job = null
  }

  const t = await getTranslations()

  return generateJobDetailMetadata({ locale, job, notFoundTitle: t('recruitment.jobDetail.notFoundTitle') })
}

export default async function JobDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  let job: Awaited<ReturnType<typeof getCachedJobDescription>> | null = null
  try {
    job = await getCachedJobDescription(slug)
  } catch (error) {
    console.error('[SSR] job detail fetch failed:', error)
    job = null
  }

  if (!job) {
    notFound()
  }

  const t = await getTranslations()

  return (
    <ScopedIntlProvider namespaces={['recruitment', 'richTextEditor', 'careers', 'dataTable']}>
      <JsonLd data={buildJobPostingJsonLd(locale, job)} />

      <div className='mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:pt-8'>
        <Button variant='outline' asChild className='mb-4 w-fit'>
          <Link href='/recruitment'>{t('recruitment.jobDetail.actions.backToList')}</Link>
        </Button>

        <JobDetail job={job} />
      </div>
    </ScopedIntlProvider>
  )
}
