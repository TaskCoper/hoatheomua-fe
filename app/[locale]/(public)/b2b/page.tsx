import ScopedIntlProvider from '@/components/scoped-intl-provider'
import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import FloatingPetals from '../_components/floating-petals'
import B2BAdvantagesSection from './_components/b2b-advantages-section'
import B2BCaseStudySection from './_components/b2b-case-study-section'
import B2BCtaSection from './_components/b2b-cta-section'
import B2BFaqSection from './_components/b2b-faq-section'
import B2BHeroSection from './_components/b2b-hero-section'
import B2BPackagesSection from './_components/b2b-packages-section'
import B2BProcessSection from './_components/b2b-process-section'
import B2BServicesSection from './_components/b2b-services-section'
import B2BTrustBarSection from './_components/b2b-trust-bar-section'
import { buildB2BJsonLd, generateB2BMetadata } from './_seo'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateB2BMetadata(locale)
}

export default async function B2BPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  return (
    <ScopedIntlProvider namespaces={['b2b']}>
      <JsonLd data={buildB2BJsonLd(locale)} />
      <div className='relative overflow-hidden'>
        <FloatingPetals />
        <B2BHeroSection />
        <B2BTrustBarSection />
        <B2BServicesSection />
        <B2BCaseStudySection />
        <B2BPackagesSection />
        <B2BAdvantagesSection />
        <B2BProcessSection />
        <B2BFaqSection />
        <B2BCtaSection />
      </div>
    </ScopedIntlProvider>
  )
}
