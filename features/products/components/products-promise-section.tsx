import ProductsPromiseMotion, { type PromiseCard } from '@/features/products/components/products-promise-motion'
import { type BannerSlot } from '@/types/config.type'
import { DeliveryTruck01Icon, Flower2Icon, MessageMultiple02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getTranslations } from 'next-intl/server'

const PROMISES = [
  {
    icon: Flower2Icon,
    titleKey: 'products.promise.items.fresh.title',
    descriptionKey: 'products.promise.items.fresh.description'
  },
  {
    icon: DeliveryTruck01Icon,
    titleKey: 'products.promise.items.delivery.title',
    descriptionKey: 'products.promise.items.delivery.description'
  },
  {
    icon: MessageMultiple02Icon,
    titleKey: 'products.promise.items.support.title',
    descriptionKey: 'products.promise.items.support.description'
  }
] as const

type ProductsPromiseSectionProps = {
  slot?: BannerSlot
}

export default async function ProductsPromiseSection({ slot }: ProductsPromiseSectionProps = {}) {
  const t = await getTranslations()
  const bannerAlt = t('products.promise.bannerAlt')

  const cards: PromiseCard[] = PROMISES.map((promise) => ({
    key: promise.titleKey,
    icon: <HugeiconsIcon icon={promise.icon} className='size-5' />,
    body: (
      <div className='space-y-1'>
        <h3 className='font-title text-base font-bold leading-tight text-primary lg:text-lg'>{t(promise.titleKey)}</h3>
        <p className='text-xs leading-relaxed text-foreground'>{t(promise.descriptionKey)}</p>
      </div>
    )
  }))

  return <ProductsPromiseMotion slot={slot} bannerAlt={bannerAlt} cards={cards} />
}
