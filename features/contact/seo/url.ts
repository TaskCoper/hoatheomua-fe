import type { Locale } from '@/lib/i18n/routing'
import { localePath, localeUrl } from '@/shared/seo'
import { CONTACT_BASE_PATH } from './config'

export const getContactPath = (locale: Locale) => localePath(locale, CONTACT_BASE_PATH)
export const getContactUrl = (locale: Locale) => localeUrl(locale, CONTACT_BASE_PATH)
