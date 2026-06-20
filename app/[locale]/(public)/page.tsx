import { fetchProductsList } from '@/features/products/server'
import type { Product } from '@/features/products/types'
import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import HomeContent from './_components/home-content'

const REVALIDATE_SECONDS = 600
const SIGNATURE_BOUQUETS_SIZE = 6
const SIGNATURE_BOUQUETS_CATEGORY_ID = [58901]

export const revalidate = 600

const HOME_META: Record<
  Locale,
  { title: string; description: string; keywords: string[]; ogLocale: string; ogAlt: string }
> = {
  vi: {
    title: 'Hoa Theo Mùa — Hoa tươi cao cấp, giao tận nơi trong 2 giờ tại TP.HCM',
    description:
      'Hoa Theo Mùa — Hệ thống hoa tươi online tại TP. Hồ Chí Minh, chuyên cung cấp hoa tươi cao cấp và giao hoa tận nơi siêu nhanh trong 2 giờ. Hoa sinh nhật, hoa khai trương, hoa 8/3, 20/10, 20/11, lan hồ điệp và nhiều bộ sưu tập theo mùa.',
    keywords: [
      'hoa tươi',
      'hoa theo mùa',
      'giao hoa tận nơi',
      'shop hoa Hồ Chí Minh',
      'đặt hoa online',
      'hoa sinh nhật',
      'hoa khai trương',
      'hoa 8/3',
      'hoa 20/10',
      'hoa 20/11',
      'lan hồ điệp',
      'hoa Noel',
      'bó hoa cao cấp'
    ],
    ogLocale: 'vi_VN',
    ogAlt: 'Hoa Theo Mùa — Bộ sưu tập hoa tươi cao cấp'
  },
  en: {
    title: 'Hoa Theo Mùa — Premium Seasonal Flowers, Delivered in 2 Hours in HCMC',
    description:
      'Hoa Theo Mùa is a Ho Chi Minh City florist offering premium seasonal bouquets with same-day flower delivery within 2 hours. Birthday, opening, and gift flowers arranged by hand.',
    keywords: [
      'fresh flowers Vietnam',
      'flower delivery HCMC',
      'florist Ho Chi Minh City',
      'seasonal flowers',
      'birthday flowers Vietnam',
      'bouquet delivery Saigon',
      'send flowers Vietnam'
    ],
    ogLocale: 'en_US',
    ogAlt: 'Hoa Theo Mùa — Premium seasonal flower collection'
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const meta = HOME_META[locale] ?? HOME_META.vi
  const path = locale === 'vi' ? '/' : '/en'

  return {
    title: { absolute: meta.title },
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: path,
      languages: {
        vi: '/',
        en: '/en',
        'x-default': '/'
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
          url: '/images/banner-one.png',
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
      images: ['/images/banner-one.png']
    },
    category: 'shopping'
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.net'

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Hoa Theo Mùa',
      legalName: 'CÔNG TY TNHH HOA THEO MÙA',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png`, width: 512, height: 512 },
      foundingDate: '2020-11-12',
      founder: { '@type': 'Person', name: 'Lê Thị Hoa Đào', jobTitle: 'Founder & CEO' },
      taxID: '0316581199',
      sameAs: [] as string[]
    },
    {
      '@type': 'Florist',
      '@id': `${SITE_URL}/#business`,
      name: 'Hoa Theo Mùa',
      image: `${SITE_URL}/images/logo.png`,
      logo: `${SITE_URL}/images/logo.png`,
      url: SITE_URL,
      description:
        'Hệ thống hoa tươi online tại TP. Hồ Chí Minh chuyên cung cấp hoa tươi cao cấp và giao hoa tận nơi siêu nhanh trong 2 giờ.',
      telephone: ['+84983024353', '+84931734353'],
      priceRange: '₫₫',
      currenciesAccepted: 'VND',
      paymentAccepted: 'Cash, Bank Transfer, Credit Card',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Số 13A Đào Duy Anh, Phường 9, Quận Phú Nhuận',
        addressLocality: 'Thành phố Hồ Chí Minh',
        addressRegion: 'TP. Hồ Chí Minh',
        addressCountry: 'VN'
      },
      areaServed: { '@type': 'City', name: 'Ho Chi Minh City' },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '08:00',
          closes: '21:00'
        }
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: 325,
        bestRating: '5',
        worstRating: '1'
      },
      founder: { '@id': `${SITE_URL}/#organization` }
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Hoa Theo Mùa',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: ['vi-VN', 'en-US']
    }
  ]
}

export default async function HomePage() {
  let signatureBouquets: Product[] = []
  let signatureBouquetsNextCursor = 0

  try {
    const response = await fetchProductsList(
      {
        size: SIGNATURE_BOUQUETS_SIZE,
        categoryIds: SIGNATURE_BOUQUETS_CATEGORY_ID
      },
      { revalidate: REVALIDATE_SECONDS }
    )
    signatureBouquets = response.value?.data ?? []
    signatureBouquetsNextCursor = response.value?.paginator.next.id ?? 0
  } catch {
    // Render the page with an empty signature list on fetch failure.
  }

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <HomeContent signatureBouquets={signatureBouquets} signatureBouquetsNextCursor={signatureBouquetsNextCursor} />
    </>
  )
}
