import type { Locale } from '@/lib/i18n/routing'
import { SITE_URL } from './constants'
import type { LocaleCopy } from './types'
import { localeUrl } from './url'

type NavCopy = { name: string; description: string }

/**
 * The site's primary destinations, in the order they appear in the header nav.
 * `name` deliberately matches the visible anchor text in
 * `features/layout/components/nav-bar.tsx` - Google cross-checks structured data
 * against what's actually on the page, so drifting labels weaken the signal
 * rather than adding one. `description` is the one-line summary a sitelink shows
 * underneath its title.
 */
const SITE_NAV = [
  {
    key: 'products',
    path: '/products',
    vi: {
      name: 'Sản phẩm',
      description: 'Bó hoa, giỏ hoa và lẵng hoa tươi theo mùa - giao trong 2 giờ tại TP.HCM.'
    },
    en: {
      name: 'Products',
      description: 'Seasonal bouquets, flower baskets and arrangements delivered within 2 hours in HCMC.'
    }
  },
  {
    key: 'b2b',
    path: '/b2b',
    vi: {
      name: 'Doanh nghiệp',
      description: 'Hoa sự kiện, hoa văn phòng và hợp đồng hoa định kỳ cho doanh nghiệp.'
    },
    en: {
      name: 'For Business',
      description: 'Event flowers, office arrangements and recurring floral contracts for companies.'
    }
  },
  {
    key: 'news',
    path: '/news',
    vi: {
      name: 'Tin tức',
      description: 'Mẹo chăm hoa, ý tưởng cắm hoa và câu chuyện 12 mùa hoa Hà Nội.'
    },
    en: {
      name: 'News',
      description: 'Flower care tips, arrangement ideas and stories from the 12 flower seasons.'
    }
  },
  {
    key: 'about',
    path: '/about',
    vi: {
      name: 'Giới thiệu',
      description: 'Câu chuyện, đội ngũ và cam kết chất lượng của Hoa Theo Mùa.'
    },
    en: {
      name: 'About',
      description: 'The story, the team and the quality promise behind Hoa Theo Mùa.'
    }
  },
  {
    key: 'recruitment',
    path: '/recruitment',
    vi: {
      name: 'Tuyển dụng',
      description: 'Vị trí đang tuyển tại cửa hàng, xưởng hoa và đội giao hàng.'
    },
    en: {
      name: 'Careers',
      description: 'Open roles across our stores, floral studio and delivery team.'
    }
  },
  {
    key: 'contact',
    path: '/contact',
    vi: {
      name: 'Liên hệ',
      description: 'Hotline, địa chỉ cửa hàng và tư vấn đặt hoa theo yêu cầu.'
    },
    en: {
      name: 'Contact',
      description: 'Hotline, store address and help with custom flower orders.'
    }
  }
] as const satisfies ReadonlyArray<{ key: string; path: string } & LocaleCopy<NavCopy>>

export const siteNavigationId = (key: string) => `${SITE_URL}/#nav-${key}`

/**
 * `SiteNavigationElement` nodes for the main sections of the site. These tell
 * search engines which pages are the site's top-level destinations and what each
 * one is for - the same signal Google uses when it decides to render sitelinks
 * (the indented sub-results under a listing). Sitelinks are always algorithmic:
 * this makes the site eligible and gives Google the labels to use, it can't
 * force them to appear.
 */
export const buildSiteNavigationElements = (locale: Locale) =>
  SITE_NAV.map((entry) => ({
    '@type': 'SiteNavigationElement' as const,
    '@id': siteNavigationId(entry.key),
    name: entry[locale].name,
    description: entry[locale].description,
    url: localeUrl(locale, entry.path)
  }))

export const siteNavigationRefs = () => SITE_NAV.map((entry) => ({ '@id': siteNavigationId(entry.key) }))
