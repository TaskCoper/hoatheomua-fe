import ScopedIntlProvider from '@/components/scoped-intl-provider'
import AboutAdvantagesSection from '@/features/about/components/about-advantages-section'
import AboutBrandValuesSection from '@/features/about/components/about-brand-values-section'
import AboutHeroSection from '@/features/about/components/about-hero-section'
import AboutPressSection from '@/features/about/components/about-press-section'
import AboutProductLinesSection from '@/features/about/components/about-product-lines-section'
import AboutTestimonialsSection from '@/features/about/components/about-testimonials-section'
import AboutVisionMissionSection from '@/features/about/components/about-vision-mission-section'
import { buildAboutJsonLd, generateAboutMetadata } from '@/features/about/seo'
import type { Locale } from '@/lib/i18n/routing'
import FloatingPetals from '@/shared/components/floating-petals'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateAboutMetadata(locale)
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const aboutJsonLd = await buildAboutJsonLd(locale)

  return (
    <ScopedIntlProvider namespaces={['about']}>
      <JsonLd data={aboutJsonLd} />

      <div className='relative overflow-hidden'>
        <FloatingPetals />
        <AboutHeroSection />
        <AboutVisionMissionSection />
        <AboutBrandValuesSection />
        <AboutProductLinesSection />
        <AboutAdvantagesSection />
        <AboutTestimonialsSection />
        <AboutPressSection />
      </div>
    </ScopedIntlProvider>
  )
}
