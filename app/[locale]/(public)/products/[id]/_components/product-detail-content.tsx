import type { ProductDetail } from '@/features/products/types'
import FloatingPetals from '../../../_components/floating-petals'
import ProductsPromiseSection from '../../_components/products-promise-section'
import ProductBreadcrumb from './product-breadcrumb'
import ProductDetailsTabs from './product-details-tabs'
import ProductGallery from './product-gallery'
import ProductPromiseCard from './product-promise-card'
import ProductPurchaseBox from './product-purchase-box'
import ProductSummary from './product-summary'

export default function ProductDetailContent({ product }: { product: ProductDetail }) {
  const retail = product.prices.retail
  const oldPrice = product.prices.old
  const hasDiscount = oldPrice > retail
  const discountPercent = hasDiscount ? Math.round(((oldPrice - retail) / oldPrice) * 100) : 0
  const description = (product.description ?? '').trim()
  const content = (product.content ?? '').trim()

  return (
    <div className='relative overflow-hidden'>
      <section className='relative px-4 pt-4 sm:px-6 lg:px-10 lg:pt-8 xl:px-16'>
        <div className='mx-auto w-full max-w-7xl'>
          <ProductBreadcrumb name={product.name} />

          <div className='relative mt-5 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-6 xl:gap-x-8'>
            <div className='lg:col-span-7 lg:row-start-1 xl:col-span-8'>
              <ProductGallery
                name={product.name}
                avatar={product.images.avatar}
                others={product.images.others ?? []}
                discountPercent={discountPercent}
                categoryName={product.category?.name ?? null}
              />
            </div>

            <div className='space-y-4 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:space-y-6 xl:col-span-4 xl:col-start-9'>
              <ProductSummary
                name={product.name}
                brand={product.brand?.name ?? null}
                type={product.type?.name ?? null}
                available={product.inventory.available}
              />

              <ProductPurchaseBox
                productId={product.id}
                productName={product.name}
                available={product.inventory.available}
                retail={retail}
                oldPrice={oldPrice}
                units={product.units?.list ?? []}
              />

              <ProductPromiseCard />
            </div>

            <div className='lg:col-span-7 lg:col-start-1 lg:row-start-2 xl:col-span-8'>
              <ProductDetailsTabs
                description={description}
                content={content}
                code={product.code || null}
                brand={product.brand?.name ?? null}
                type={product.type?.name ?? null}
                category={product.category?.name ?? null}
                country={product.countryName || null}
                shipping={product.shipping ?? null}
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
