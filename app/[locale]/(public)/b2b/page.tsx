import ScopedIntlProvider from '@/components/scoped-intl-provider'
import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import FloatingPetals from '../_components/floating-petals'
import { getB2BServiceDetails } from './[service]/_data.server'
import B2BAdvantagesSection from './_components/b2b-advantages-section'
import B2BCaseStudySection from './_components/b2b-case-study-section'
import B2BCtaSection from './_components/b2b-cta-section'
import B2BFaqSection from './_components/b2b-faq-section'
import B2BHeroSection from './_components/b2b-hero-section'
import B2BPackagesSection from './_components/b2b-packages-section'
import B2BProcessSection from './_components/b2b-process-section'
import B2BServicesSection from './_components/b2b-services-section'
import B2BTrustBarSection from './_components/b2b-trust-bar-section'
import { getB2BOverview } from './_data.server'
import { buildB2BJsonLd, generateB2BMetadata } from './_seo'

export const revalidate = 30

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateB2BMetadata(locale)
}

export default async function B2BPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  // Both loaders share one per-request-cached `b2bServices` group fetch.
  const [overview, details] = await Promise.all([getB2BOverview(), getB2BServiceDetails()])
  // Services grid cards are the single-source-of-truth per-service `card` docs.
  const cards = Object.fromEntries([...details].map(([slug, detail]) => [slug, detail.card]))

  return (
    <ScopedIntlProvider namespaces={['b2b']}>
      <JsonLd data={buildB2BJsonLd(locale)} />
      <div className='relative overflow-hidden'>
        <FloatingPetals />
        <B2BHeroSection hero={overview.hero} locale={locale} />
        <B2BTrustBarSection trustBar={overview.trustBar} locale={locale} />
        <B2BServicesSection services={overview.services} cards={cards} locale={locale} />
        <B2BCaseStudySection caseStudies={overview.caseStudies} locale={locale} />
        <B2BPackagesSection packages={overview.packages} locale={locale} />
        <B2BAdvantagesSection advantages={overview.advantages} locale={locale} />
        <B2BProcessSection process={overview.process} locale={locale} />
        <B2BFaqSection faq={overview.faq} locale={locale} />
        <B2BCtaSection cta={overview.cta} locale={locale} />
      </div>
    </ScopedIntlProvider>
  )
}
