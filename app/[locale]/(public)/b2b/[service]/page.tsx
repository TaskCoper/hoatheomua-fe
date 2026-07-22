import ScopedIntlProvider from '@/components/scoped-intl-provider'
import type { Locale } from '@/lib/i18n/routing'
import { routing } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import B2BCtaSection from '../_components/b2b-cta-section'
import { B2B_SERVICE_SLUGS, buildB2BServiceJsonLd, generateB2BServiceMetadata, type B2BServiceSlug } from '../_seo'
import ServiceAudienceSection from './_components/service-audience-section'
import ServiceBenefitsSection from './_components/service-benefits-section'
import ServiceBreadcrumb from './_components/service-breadcrumb'
import ServiceClosingSection from './_components/service-closing-section'
import ServiceDetailHero from './_components/service-detail-hero'
import ServiceDetailLayout from './_components/service-detail-layout'
import ServiceFaqSection from './_components/service-faq-section'
import ServiceInclusionsSection from './_components/service-inclusions-section'
import ServiceIntroSection from './_components/service-intro-section'
import ServiceMiceSection from './_components/service-mice-section'
import ServicePersonalizationSection from './_components/service-personalization-section'
import ServiceProcessSection from './_components/service-process-section'
import ServiceScheduleSection from './_components/service-schedule-section'
import ServiceStatsSection from './_components/service-stats-section'
import { getServiceSections, SECTION_IDS, SERVICE_DETAILS } from './_content'

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
  return generateB2BServiceMetadata(locale, service)
}

export default async function B2BServicePage({ params }: { params: Promise<{ locale: Locale; service: string }> }) {
  const { locale, service } = await params
  if (!isValidSlug(service)) notFound()

  const config = SERVICE_DETAILS[service]
  const sections = getServiceSections(config)

  return (
    <ScopedIntlProvider namespaces={['b2b']}>
      <JsonLd data={buildB2BServiceJsonLd(locale, service)} />
      {/* overflow-clip (not -hidden): clips the floating petals without creating a
          scroll container, so the sidebar's position:sticky works against the viewport. */}
      <div className='relative overflow-clip pb-4'>
        <ServiceBreadcrumb service={config} />
        <ServiceDetailHero service={config} />

        <ServiceDetailLayout config={config} sections={sections}>
          <ServiceIntroSection config={config} id={SECTION_IDS.intro} />
          {config.hasStats ? <ServiceStatsSection serviceKey={config.i18nKey} id={SECTION_IDS.stats} /> : null}
          <ServiceInclusionsSection config={config} id={SECTION_IDS.inclusions} />
          {config.hasMice ? <ServiceMiceSection config={config} id={SECTION_IDS.mice} /> : null}
          {config.hasSchedule ? <ServiceScheduleSection config={config} id={SECTION_IDS.schedule} /> : null}
          {config.hasPersonalization ? (
            <ServicePersonalizationSection config={config} id={SECTION_IDS.personalization} />
          ) : null}
          <ServiceBenefitsSection config={config} id={SECTION_IDS.benefits} />
          {config.hasProcess ? <ServiceProcessSection config={config} id={SECTION_IDS.process} /> : null}
          {config.hasAudience ? <ServiceAudienceSection config={config} id={SECTION_IDS.audience} /> : null}
          {config.hasFaq ? <ServiceFaqSection serviceKey={config.i18nKey} id={SECTION_IDS.faq} /> : null}
          <ServiceClosingSection config={config} id={SECTION_IDS.closing} />
        </ServiceDetailLayout>

        <B2BCtaSection />
      </div>
    </ScopedIntlProvider>
  )
}
