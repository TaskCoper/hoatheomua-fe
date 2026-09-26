import ProductBreadcrumb from '@/features/products/components/product-breadcrumb'
import ProductDetailsTabs from '@/features/products/components/product-details-tabs'
import ProductGallery from '@/features/products/components/product-gallery'
import ProductPurchaseBox from '@/features/products/components/product-purchase-box'
import ProductSummary from '@/features/products/components/product-summary'
import { ProductVariantProvider } from '@/features/products/components/product-variant-context'
import ProductsPromiseSection from '@/features/products/components/products-promise-section'
import type { ProductDetail } from '@/features/products/types'
import FloatingPetals from '@/shared/components/floating-petals'
import { BANNER_SLOTS } from '@/types/config.type'

export default function ProductDetailContent({
  product,
  landingUrl
}: {
  product: ProductDetail
  landingUrl: string | null
}) {
  const name = product.productName ?? ''

  return (
    <div className='relative overflow-hidden'>
      <section className='relative px-4 pt-4 sm:px-6 lg:px-10 lg:pt-8 xl:px-16'>
        <div className='mx-auto w-full max-w-7xl'>
          <ProductBreadcrumb name={name} />

          <ProductVariantProvider product={product}>
            <div className='relative mt-5 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-6 xl:gap-x-8'>
              <div className='lg:col-span-7 lg:row-start-1 xl:col-span-8'>
                <ProductGallery />
              </div>

              <div className='space-y-4 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:space-y-6 xl:col-span-4 xl:col-start-9'>
                <ProductSummary name={name} brand={product.brand} type={product.productType} />

                <ProductPurchaseBox />

                {/* <ProductPromiseCard /> */}
              </div>

              <div className='lg:col-span-7 lg:col-start-1 lg:row-start-2 xl:col-span-8'>
                <ProductDetailsTabs
                  code={product.productCode}
                  brand={product.brand}
                  type={product.productType}
                  category={product.categoryName}
                  country={product.origin}
                  shipping={{
                    width: product.width,
                    height: product.height,
                    length: product.length,
                    weight: product.weight
                  }}
                  landingUrl={landingUrl}
                />
              </div>
            </div>
          </ProductVariantProvider>
        </div>
      </section>

      <ProductsPromiseSection slot={BANNER_SLOTS.product} />

      <FloatingPetals />
    </div>
  )
}
