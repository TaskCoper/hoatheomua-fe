import type { Locale } from '@/lib/i18n/routing'
import { localePath, localeUrl } from '@/shared/seo'
import { NEWS_BASE_PATH } from './config'

export const getNewsListPath = (locale: Locale) => localePath(locale, NEWS_BASE_PATH)
export const getNewsListUrl = (locale: Locale) => localeUrl(locale, NEWS_BASE_PATH)

export const getNewsItemPath = (locale: Locale, slug: string) => localePath(locale, `${NEWS_BASE_PATH}/${slug}`)
export const getNewsItemUrl = (locale: Locale, slug: string) => localeUrl(locale, `${NEWS_BASE_PATH}/${slug}`)
