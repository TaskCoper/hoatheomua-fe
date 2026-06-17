import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import FloatingPetals from '../_components/floating-petals'
import AboutHeroSection from './_components/about-hero-section'
import AboutTestimonialsSection from './_components/about-testimonials-section'
import AdvantagesSection from './_components/advantages-section'
import BrandValuesSection from './_components/brand-values-section'
import PressSection from './_components/press-section'
import ProductLinesSection from './_components/product-lines-section'

const ABOUT_META: Record<
  Locale,
  { title: string; description: string; keywords: string[]; ogLocale: string; ogAlt: string }
> = {
  vi: {
    title: 'Câu Chuyện Của Chúng Tôi',
    description:
      'Hoa Theo Mùa thành lập 12/11/2020 bởi CEO Lê Thị Hoa Đào — thương hiệu hoa tươi cao cấp lấy cảm hứng từ "Hà Nội 12 mùa hoa", mang đến giá trị bình yên qua từng bó hoa 100% tự nhiên.',
    keywords: [
      'về Hoa Theo Mùa',
      'câu chuyện thương hiệu hoa',
      'Lê Thị Hoa Đào',
      'thương hiệu hoa tươi Việt Nam',
      '12 mùa hoa Hà Nội',
      'shop hoa cao cấp',
      'florist Việt Nam'
    ],
    ogLocale: 'vi_VN',
    ogAlt: 'Câu chuyện thương hiệu Hoa Theo Mùa'
  },
  en: {
    title: 'Our Story',
    description:
      'Founded on November 12, 2020 by CEO Lê Thị Hoa Đào, Hoa Theo Mùa is a premium Vietnamese florist inspired by "Hanoi\'s 12 flower seasons", crafting 100% natural bouquets that bring serenity.',
    keywords: [
      'about Hoa Theo Mùa',
      'Vietnamese florist story',
      'Le Thi Hoa Dao',
      'premium florist Vietnam',
      'seasonal flowers brand',
      'Hanoi flower seasons'
    ],
    ogLocale: 'en_US',
    ogAlt: 'About Hoa Theo Mùa — Our story'
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const meta = ABOUT_META[locale] ?? ABOUT_META.vi
  const path = locale === 'vi' ? '/about' : '/en/about'

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: path,
      languages: {
        vi: '/about',
        en: '/en/about',
        'x-default': '/about'
      }
    },
    openGraph: {
      type: 'website',
      siteName: 'Hoa Theo Mùa',
      title: meta.title,
      description: meta.description,
      url: path,
      locale: meta.ogLocale,
      alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
      images: [
        {
          url: '/images/flower.png',
          width: 1200,
          height: 630,
          alt: meta.ogAlt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/images/flower.png']
    }
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/about#webpage`,
      url: `${SITE_URL}/about`,
      name: 'Câu Chuyện Của Chúng Tôi — Hoa Theo Mùa',
      description:
        'Hoa Theo Mùa thành lập 12/11/2020 bởi CEO Lê Thị Hoa Đào — thương hiệu hoa tươi cao cấp lấy cảm hứng từ "Hà Nội 12 mùa hoa".',
      inLanguage: 'vi-VN',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/images/flower.png` }
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Hoa Theo Mùa',
      legalName: 'CÔNG TY TNHH HOA THEO MÙA',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` },
      foundingDate: '2020-11-12',
      taxID: '0316581199',
      slogan: 'Hà Nội 12 Mùa Hoa',
      description:
        'Thương hiệu hoa tươi cao cấp tại TP. Hồ Chí Minh — mang đến giá trị cảm xúc, bình yên qua từng bó hoa theo mùa.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Số 13A Đào Duy Anh, Phường 9, Quận Phú Nhuận',
        addressLocality: 'Thành phố Hồ Chí Minh',
        addressCountry: 'VN'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+84983024353',
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese', 'English']
      },
      founder: {
        '@type': 'Person',
        '@id': `${SITE_URL}/about#founder`,
        name: 'Lê Thị Hoa Đào',
        jobTitle: 'Nhà sáng lập & CEO',
        worksFor: { '@id': `${SITE_URL}/#organization` }
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/about#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Giới thiệu', item: `${SITE_URL}/about` }
      ]
    }
  ]
}

export default function AboutPage() {
  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <div className='relative overflow-hidden'>
        <FloatingPetals />

        <AboutHeroSection />

        <BrandValuesSection />

        <ProductLinesSection />

        <AdvantagesSection />

        <AboutTestimonialsSection />

        <PressSection />
      </div>
    </>
  )
}
