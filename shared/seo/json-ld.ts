import type { Locale } from '@/lib/i18n/routing'
import { homeName, SITE_URL } from './constants'

export type BreadcrumbStep = { name: string; url: string }

/**
 * Build a `BreadcrumbList` graph node. The home crumb (position 1) is added
 * automatically; pass the trail starting at position 2.
 */
export const buildBreadcrumbList = (locale: Locale, id: string, trail: BreadcrumbStep[]) => ({
  '@type': 'BreadcrumbList',
  '@id': id,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: homeName(locale), item: `${SITE_URL}/` },
    ...trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: step.name,
      item: step.url
    }))
  ]
})
