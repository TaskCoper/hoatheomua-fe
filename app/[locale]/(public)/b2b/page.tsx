import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import FloatingPetals from '../_components/floating-petals'
import B2BAdvantagesSection from './_components/b2b-advantages-section'
import B2BCtaSection from './_components/b2b-cta-section'
import B2BHeroSection from './_components/b2b-hero-section'
import B2BPackagesSection from './_components/b2b-packages-section'
import B2BProcessSection from './_components/b2b-process-section'
import B2BServicesSection from './_components/b2b-services-section'

const B2B_META: Record<
  Locale,
  { title: string; description: string; keywords: string[]; ogLocale: string; ogAlt: string }
> = {
  vi: {
    title: 'Dịch Vụ Hoa Cho Doanh Nghiệp',
    description:
      'Hoa Theo Mùa cung cấp dịch vụ hoa B2B cao cấp cho doanh nghiệp tại Việt Nam: hoa văn phòng định kỳ, sự kiện công ty, khách sạn, đám cưới, quà tặng và khai trương.',
    keywords: [
      'hoa B2B',
      'hoa doanh nghiệp',
      'hoa văn phòng',
      'hoa khách sạn',
      'hoa sự kiện',
      'hoa cưới',
      'quà tặng doanh nghiệp',
      'hoa Theo Mùa B2B'
    ],
    ogLocale: 'vi_VN',
    ogAlt: 'Dịch vụ hoa doanh nghiệp Hoa Theo Mùa'
  },
  en: {
    title: 'Flowers For Business',
    description:
      'Hoa Theo Mùa delivers premium B2B floral services across Vietnam: office subscriptions, corporate events, hotel styling, weddings, corporate gifts and grand-opening installations.',
    keywords: [
      'B2B flowers Vietnam',
      'corporate flower subscription',
      'office flowers',
      'hotel florist',
      'event florist Vietnam',
      'wedding florist',
      'corporate gifting flowers'
    ],
    ogLocale: 'en_US',
    ogAlt: 'Hoa Theo Mùa B2B floral services'
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const meta = B2B_META[locale] ?? B2B_META.vi
  const path = locale === 'vi' ? '/b2b' : '/en/b2b'

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: path,
      languages: {
        vi: '/b2b',
        en: '/en/b2b',
        'x-default': '/b2b'
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

const b2bJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/b2b#service`,
      name: 'Hoa Theo Mùa — B2B Floral Services',
      serviceType: 'Corporate floral design and delivery',
      areaServed: ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
      provider: { '@id': `${SITE_URL}/#organization` },
      description:
        'Premium floral services for businesses in Vietnam — office subscriptions, corporate events, hospitality styling, weddings and corporate gifting.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Boutique',
          priceCurrency: 'VND',
          price: '8000000',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '8000000',
            priceCurrency: 'VND',
            unitText: 'MONTH'
          }
        },
        {
          '@type': 'Offer',
          name: 'Atelier',
          priceCurrency: 'VND',
          price: '25000000',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '25000000',
            priceCurrency: 'VND',
            unitText: 'MONTH'
          }
        },
        {
          '@type': 'Offer',
          name: 'Signature',
          priceCurrency: 'VND',
          description: 'Custom pricing on request'
        }
      ]
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/b2b#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Doanh nghiệp', item: `${SITE_URL}/b2b` }
      ]
    }
  ]
}

export default function B2BPage() {
  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(b2bJsonLd) }} />
      <div className='relative overflow-hidden'>
        <FloatingPetals />

        <B2BHeroSection />

        <B2BServicesSection />

        <B2BPackagesSection />

        <B2BAdvantagesSection />

        <B2BProcessSection />

        <B2BCtaSection />
      </div>
    </>
  )
}
