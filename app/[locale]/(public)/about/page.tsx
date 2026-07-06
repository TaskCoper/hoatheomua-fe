import type { Locale } from '@/lib/i18n/routing'
import { JsonLd } from '@/shared/seo'
import type { Metadata } from 'next'
import FloatingPetals from '../_components/floating-petals'
import AboutAdvantagesSection from './_components/about-advantages-section'
import AboutBrandValuesSection from './_components/about-brand-values-section'
import AboutHeroSection from './_components/about-hero-section'
import AboutPressSection from './_components/about-press-section'
import AboutProductLinesSection from './_components/about-product-lines-section'
import AboutTestimonialsSection from './_components/about-testimonials-section'
import AboutVisionMissionSection from './_components/about-vision-mission-section'
import { buildAboutJsonLd, generateAboutMetadata } from './_seo'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return generateAboutMetadata(locale)
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const aboutJsonLd = await buildAboutJsonLd(locale)

  return (
    <>
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
    </>
  )
}
