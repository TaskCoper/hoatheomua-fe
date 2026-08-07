import ScopedIntlProvider from '@/components/scoped-intl-provider'
import B2BCtaSection from '@/features/b2b/components/b2b-cta-section'
import { getB2BOverview } from '@/features/b2b/data.server'
import {
  B2B_SERVICE_SLUGS,
  buildB2BServiceJsonLd,
  generateB2BServiceMetadata,
  type B2BServiceSlug
} from '@/features/b2b/seo'
import ServiceAudienceSection from '@/features/b2b/service/components/service-audience-section'
import ServiceBenefitsSection from '@/features/b2b/service/components/service-benefits-section'
import ServiceBreadcrumb from '@/features/b2b/service/components/service-breadcrumb'
import ServiceClosingSection from '@/features/b2b/service/components/service-closing-section'
import ServiceDetailHero from '@/features/b2b/service/components/service-detail-hero'
import ServiceDetailLayout from '@/features/b2b/service/components/service-detail-layout'
import ServiceFaqSection from '@/features/b2b/service/components/service-faq-section'
import ServiceInclusionsSection from '@/features/b2b/service/components/service-inclusions-section'
import ServiceIntroSection from '@/features/b2b/service/components/service-intro-section'
import ServiceMiceSection from '@/features/b2b/service/components/service-mice-section'
import ServicePersonalizationSection from '@/features/b2b/service/components/service-personalization-section'
import ServiceProcessSection from '@/features/b2b/service/components/service-process-section'
import ServiceScheduleSection from '@/features/b2b/service/components/service-schedule-section'
import ServiceStatsSection from '@/features/b2b/service/components/service-stats-section'
import { getServiceSections, SECTION_IDS } from '@/features/b2b/service/content'
import { getB2BServiceDetail, getB2BServiceDetails } from '@/features/b2b/service/data.server'
import type { Locale } from '@/lib/i18n/routing'
import { routing } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Same `b2bServices` config group as /b2b, same webhook purge - see the note there.
export const revalidate = 3600

const isValidSlug = (value: string): value is B2BServiceSlug => (B2B_SERVICE_SLUGS as readonly string[]).includes(value)

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => B2B_SERVICE_SLUGS.map((service) => ({ locale, service })))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; service: string }>
}): Promise<Metadata> {
  const { locale, service } = await params
  if (!isValidSlug(service)) return {}
  const detail = await getB2BServiceDetail(service)
  if (!detail) return {}
  return generateB2BServiceMetadata(locale, service, detail)
}

export default async function B2BServicePage({ params }: { params: Promise<{ locale: Locale; service: string }> }) {
  const { locale, service } = await params
  if (!isValidSlug(service)) notFound()

  const [details, overview] = await Promise.all([getB2BServiceDetails(), getB2BOverview()])
  const detail = details.get(service)
  if (!detail) notFound()

  const sections = getServiceSections(detail)
  const siblings = [...details.values()].filter((d) => d.slug !== detail.slug)

  return (
    <ScopedIntlProvider namespaces={['b2b']}>
      <JsonLd data={buildB2BServiceJsonLd(locale, service, detail)} />
      {/* overflow-clip (not -hidden): clips the floating petals without creating a
          scroll container, so the sidebar's position:sticky works against the viewport. */}
      <div className='relative overflow-clip pb-4'>
        <ServiceBreadcrumb detail={detail} locale={locale} />
        <ServiceDetailHero detail={detail} locale={locale} />

        <ServiceDetailLayout detail={detail} locale={locale} sections={sections} siblings={siblings}>
          <ServiceIntroSection detail={detail} locale={locale} id={SECTION_IDS.intro} />
          <ServiceStatsSection detail={detail} locale={locale} id={SECTION_IDS.stats} />
          <ServiceInclusionsSection detail={detail} locale={locale} id={SECTION_IDS.inclusions} />
          <ServiceMiceSection detail={detail} locale={locale} id={SECTION_IDS.mice} />
          <ServiceScheduleSection detail={detail} locale={locale} id={SECTION_IDS.schedule} />
          <ServicePersonalizationSection detail={detail} locale={locale} id={SECTION_IDS.personalization} />
          <ServiceBenefitsSection detail={detail} locale={locale} id={SECTION_IDS.benefits} />
          <ServiceProcessSection detail={detail} locale={locale} id={SECTION_IDS.process} />
          <ServiceAudienceSection detail={detail} locale={locale} id={SECTION_IDS.audience} />
          <ServiceFaqSection detail={detail} locale={locale} id={SECTION_IDS.faq} />
          <ServiceClosingSection detail={detail} locale={locale} id={SECTION_IDS.closing} />
        </ServiceDetailLayout>

        <B2BCtaSection cta={overview.cta} locale={locale} />
      </div>
    </ScopedIntlProvider>
  )
}
