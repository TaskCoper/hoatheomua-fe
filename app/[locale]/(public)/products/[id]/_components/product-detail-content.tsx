'use client'

import type { ProductDetail } from '@/features/products/types'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { ProductSignatureMap, ProductsSignatureConfigItem } from '@/types/config.type'
import { useState } from 'react'
import FloatingPetals from '../../../_components/floating-petals'
import ProductsPromiseSection from '../../_components/products-promise-section'
import ProductBreadcrumb from './product-breadcrumb'
import ProductChildSelector from './product-child-selector'
import ProductDetailsTabs from './product-details-tabs'
import ProductGallery from './product-gallery'
import ProductPromiseCard from './product-promise-card'
import ProductPurchaseBox from './product-purchase-box'
import ProductSummary from './product-summary'

export default function ProductDetailContent({ product }: { product: ProductDetail }) {
  const childs = product.childs ?? []
  const hasChildren = childs.length > 0

  const { configs } = useGetPublicConfigs<ProductsSignatureConfigItem>({ group: 'products', key: 'products.signature' })
  const signatureProducts = configs[0]?.value.value ?? '{}'
  const parsed = JSON.parse(signatureProducts) as ProductSignatureMap
  const landingUrl = parsed[String(product.id)]?.trim() || null

  const [activeChildId, setActiveChildId] = useState<number | null>(hasChildren ? childs[0].id : null)

  const activeChild = hasChildren ? (childs.find((child) => child.id === activeChildId) ?? childs[0]) : null
  const active = activeChild ?? product

  const retail = active.prices?.retail ?? 0
  const oldPrice = active.prices?.old ?? 0
  const hasDiscount = oldPrice > retail
  const discountPercent = hasDiscount ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0
  const description = (active.description ?? product.description ?? '').trim()
  const content = (active.content ?? product.content ?? '').trim()
  const activeName = active.name ?? product.name ?? ''
  const breadcrumbName = product.name ?? activeName
  const available = active.inventory?.available ?? 0
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
                avatar={active.images?.avatar ?? null}
                others={active.images?.others ?? []}
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
                <ProductChildSelector childs={childs} activeChildId={activeChildId} onChange={setActiveChildId} />
              ) : null}

              <ProductPurchaseBox
                productId={product.id}
                variantId={hasChildren ? active.id : null}
                productName={activeName}
                available={available}
                retail={retail}
                oldPrice={oldPrice}
                units={flatUnits}
              />

              <ProductPromiseCard />
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

      <ProductsPromiseSection />

      <FloatingPetals />
    </div>
  )
}
