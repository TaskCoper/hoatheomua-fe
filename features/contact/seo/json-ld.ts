import type { Locale } from '@/lib/i18n/routing'
import {
  buildBreadcrumbList,
  BUSINESS_ADDRESS,
  BUSINESS_AREA_SERVED,
  BUSINESS_CURRENCIES_ACCEPTED,
  BUSINESS_EMAIL,
  BUSINESS_ID,
  BUSINESS_LOGO_URL,
  BUSINESS_OPENING_HOURS,
  BUSINESS_PAYMENT_ACCEPTED,
  BUSINESS_PHONES,
  BUSINESS_PRICE_RANGE,
  inLanguage,
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID
} from '@/shared/seo'
import { CONTACT_BASE_PATH, CONTACT_COPY } from './config'
import { localePath, localeUrl } from '@/shared/seo/url'

export const buildContactJsonLd = (locale: Locale) => {
  const copy = CONTACT_COPY[locale]
  const path = localePath(locale, CONTACT_BASE_PATH)
  const url = localeUrl(locale, CONTACT_BASE_PATH)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${SITE_URL}${path}#webpage`,
        url,
        name: `${copy.title} — ${SITE_NAME}`,
        description: copy.description,
        inLanguage: inLanguage(locale),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID }
      },
      {
        '@type': 'LocalBusiness',
        '@id': BUSINESS_ID,
        name: SITE_NAME,
        url: SITE_URL,
        image: BUSINESS_LOGO_URL,
        telephone: BUSINESS_PHONES,
        email: BUSINESS_EMAIL,
        priceRange: BUSINESS_PRICE_RANGE,
        currenciesAccepted: BUSINESS_CURRENCIES_ACCEPTED,
        paymentAccepted: BUSINESS_PAYMENT_ACCEPTED,
        address: BUSINESS_ADDRESS,
        areaServed: BUSINESS_AREA_SERVED,
        openingHoursSpecification: BUSINESS_OPENING_HOURS,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: BUSINESS_PHONES[0],
          email: BUSINESS_EMAIL,
          contactType: 'customer service',
          areaServed: 'VN',
          availableLanguage: ['Vietnamese', 'English']
        }
      },
      buildBreadcrumbList(locale, `${SITE_URL}${path}#breadcrumb`, [{ name: copy.breadcrumb, url }])
    ]
  }
}
