import type { Locale } from '@/lib/i18n/routing'
import { localePath, localeUrl } from '@/shared/seo'
import { PRODUCTS_BASE_PATH } from './config'

export const getProductsListPath = (locale: Locale) => localePath(locale, PRODUCTS_BASE_PATH)
export const getProductsListUrl = (locale: Locale) => localeUrl(locale, PRODUCTS_BASE_PATH)

export const getProductPath = (locale: Locale, id: number | string) => localePath(locale, `${PRODUCTS_BASE_PATH}/${id}`)
export const getProductUrl = (locale: Locale, id: number | string) => localeUrl(locale, `${PRODUCTS_BASE_PATH}/${id}`)
