import type { Locale } from '@/lib/i18n/routing'
import { buildPageMetadata } from '@/shared/seo'
import type { Metadata } from 'next'
import { CONTACT_BASE_PATH, CONTACT_COPY } from './config'

export const generateContactMetadata = (locale: Locale): Metadata =>
  buildPageMetadata({ locale, copy: CONTACT_COPY[locale], basePath: CONTACT_BASE_PATH })
