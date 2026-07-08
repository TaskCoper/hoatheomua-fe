import { SITE_URL } from '@/shared/seo'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/sign-in',
          '/sign-up',
          '/forgot-password',
          '/cart',
          '/verification',
          '/en/sign-in',
          '/en/sign-up',
          '/en/forgot-password',
          '/en/cart',
          '/en/verification'
        ]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  }
}
