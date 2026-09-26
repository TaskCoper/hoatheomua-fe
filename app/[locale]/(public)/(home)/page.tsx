import { getCachedCategories } from '@/features/categories/queries.server'
import { CategoryProductPage, type SortableCategory } from '@/features/categories/types'
import { resolveCategoriesByIds } from '@/features/categories/utils'
import HomeContent from '@/features/home/components/home-content'
import { buildHomeJsonLd, generateHomeMetadata } from '@/features/home/seo'
import { CUSTOMIZABLE_CATEGORY_ID } from '@/features/products/constants'
import { productsQueryKey, type GetProductsParams } from '@/features/products/hooks/use-get-products'
import { getCachedProducts, prefetchCarouselProducts } from '@/features/products/queries.server'
import { getCarouselProductsParams, getSectionDefaultParams } from '@/features/products/section-defaults'
import { routing, type Locale } from '@/lib/i18n/routing'
import { getQueryClient } from '@/lib/react-query-client'
import { JsonLd } from '@/shared/seo'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  return generateHomeMetadata(locale)
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  const queryClient = getQueryClient()
  const categoryPage = [CategoryProductPage.Home]

  const homeJsonLdPromise = buildHomeJsonLd(locale)

  let categories: SortableCategory[] = []
  let customizableCategory: SortableCategory | null = null

  try {
    const [homeCategories, allCategories] = await Promise.all([
      getCachedCategories({ page: categoryPage }),
      getCachedCategories()
    ])

    categories = homeCategories
    customizableCategory = resolveCategoriesByIds(allCategories, [CUSTOMIZABLE_CATEGORY_ID])[0] ?? null

    const sectionCategories = customizableCategory ? [...categories, customizableCategory] : categories

    const prefetch = async (params: GetProductsParams, label: string) => {
      try {
        const products = await getCachedProducts(params)
        queryClient.setQueryData(productsQueryKey(params), products)
      } catch (error) {
        console.error(`[SSR] home products prefetch failed for ${label}:`, error)
      }
    }

    await Promise.all([
      ...sectionCategories.map((category) =>
        prefetch(getSectionDefaultParams(category), `category ${category.categoryId}`)
      ),
      // The flowers carousel pages through the category on its own; only its first page
      // is seeded here, so the opening slides are in the ISR HTML rather than behind a
      // client fetch.
      ...(customizableCategory
        ? [
            prefetchCarouselProducts(queryClient, getCarouselProductsParams(customizableCategory)).catch((error) =>
              console.error('[SSR] home products prefetch failed for flowers carousel:', error)
            )
          ]
        : [])
    ])
  } catch (error) {
    console.error('[SSR] home categories prefetch failed:', error)
  }

  const homeJsonLd = await homeJsonLdPromise

  return (
    <>
      <JsonLd data={homeJsonLd} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeContent categories={categories} customizableCategory={customizableCategory} />
      </HydrationBoundary>
    </>
  )
}
