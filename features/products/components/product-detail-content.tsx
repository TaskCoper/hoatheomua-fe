'use client'

import ProductBreadcrumb from '@/features/products/components/product-breadcrumb'
import ProductChildSelector from '@/features/products/components/product-child-selector'
import ProductDetailsTabs from '@/features/products/components/product-details-tabs'
import ProductGallery from '@/features/products/components/product-gallery'
import ProductPurchaseBox from '@/features/products/components/product-purchase-box'
import ProductSummary from '@/features/products/components/product-summary'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import { productDetailQuery } from '@/features/products/queries'
import type { ProductDetail } from '@/features/products/types'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import FloatingPetals from '@/shared/components/floating-petals'
import { BANNER_SLOTS, ProductSignatureMap, ProductsSignatureConfigItem } from '@/types/config.type'
import { useQueries } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useMemo, useState } from 'react'

export default function ProductDetailContent({ product }: { product: ProductDetail }) {
  const locale = useLocale()
  const childs = useMemo(() => product.childs ?? [], [product.childs])
  const hasChildren = childs.length > 0

  const { configs } = useGetPublicConfigs<ProductsSignatureConfigItem>({ group: 'products', key: 'products.signature' })
  const signatureProducts = configs[0]?.value.value ?? '{}'
  const parsed = JSON.parse(signatureProducts) as ProductSignatureMap
  const landingUrl = parsed[String(product.id)]?.trim() || null

  const childQueries = useQueries({
    queries: childs.map((child) => productDetailQuery(String(child.id), locale))
  })

  const freshChilds = useMemo(
    () =>
      childs.map((child, index) => {
        const fetched = childQueries[index]?.data?.value?.data as ProductDetail | undefined
        return fetched ?? child
      }),
    [childs, childQueries]
  )

  const defaultChild = hasChildren ? (freshChilds.find((child) => child.images?.avatar) ?? freshChilds[0]) : null
  const [activeChildId, setActiveChildId] = useState<number | null>(defaultChild?.id ?? null)

  const activeChild = hasChildren ? (freshChilds.find((child) => child.id === activeChildId) ?? defaultChild) : null
  const active = activeChild ?? product

  const inventorySource = hasChildren ? activeChild : product
  const available = inventorySource?.inventory?.available ?? 0

  const retail = active.prices?.retail ?? 0
  const oldPrice = active.prices?.old ?? 0
  const hasDiscount = oldPrice > retail
  const discountPercent = hasDiscount ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0
  const description = (active.description ?? product.description ?? '').trim()
  const content = (active.content ?? product.content ?? '').trim()
  const activeName = active.name ?? product.name ?? ''
  const breadcrumbName = product.name ?? activeName
  const flatUnits = Object.values(active.units?.list ?? {}).flat()

  return (
    <div className='relative overflow-hidden'>
      <section className='relative px-4 pt-4 sm:px-6 lg:px-10 lg:pt-8 xl:px-16'>
        <div className='mx-auto w-full max-w-7xl'>
          <ProductBreadcrumb name={breadcrumbName} />

          <div className='relative mt-5 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-6 xl:gap-x-8'>
            <div className='lg:col-span-7 lg:row-start-1 xl:col-span-8'>
              <ProductGallery
                key={active.id}
                name={activeName}
                avatar={active.images?.avatar ?? product.images?.avatar ?? null}
                others={active.images?.others?.length ? active.images.others : (product.images?.others ?? [])}
                discountPercent={discountPercent}
                categoryName={active.category?.name ?? product.category?.name ?? null}
              />
            </div>

            <div className='space-y-4 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:space-y-6 xl:col-span-4 xl:col-start-9'>
              <ProductSummary
                name={activeName}
                brand={active.brand?.name ?? product.brand?.name ?? null}
                type={active.type?.name ?? product.type?.name ?? null}
                available={available}
              />

              {hasChildren ? (
                <ProductChildSelector childs={freshChilds} activeChildId={activeChildId} onChange={setActiveChildId} />
              ) : null}

              <ProductPurchaseBox
                productId={hasChildren && activeChild ? activeChild.id : product.id}
                productName={activeName}
                available={available}
                retail={retail}
                oldPrice={oldPrice}
                units={flatUnits}
              />

              {/* <ProductPromiseCard /> */}
            </div>

            <div className='lg:col-span-7 lg:col-start-1 lg:row-start-2 xl:col-span-8'>
              <ProductDetailsTabs
                description={description}
                content={content}
                code={active.code || product.code || null}
                brand={active.brand?.name ?? product.brand?.name ?? null}
                type={active.type?.name ?? product.type?.name ?? null}
                category={active.category?.name ?? product.category?.name ?? null}
                country={active.countryName || product.countryName || null}
                shipping={active.shipping ?? product.shipping ?? null}
                landingUrl={landingUrl}
              />
            </div>
          </div>
        </div>
      </section>

      <ProductsPromiseSection slot={BANNER_SLOTS.product} />

      <FloatingPetals />
    </div>
  )
}
