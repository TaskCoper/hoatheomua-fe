import ProductsHeroMotion, { type HeroStrings } from '@/features/products/components/products-hero-motion'
import { getTranslations } from 'next-intl/server'

export default async function ProductsHeroSection() {
  const t = await getTranslations()

  const strings: HeroStrings = {
    title: t('products.hero.title'),
    description: t('products.hero.description'),
    highlights: {
      seasons: t('products.hero.highlights.seasons'),
      fastDelivery: t('products.hero.highlights.fastDelivery'),
      fresh: t('products.hero.highlights.fresh')
    },
    headline: t('products.hero.headline'),
    body: t('products.hero.body'),
    shopByType: t('products.hero.shopByType'),
    shopByOccasion: t('products.hero.shopByOccasion'),
    b2b: 'Đặt hoa cho doanh nghiệp',
    imageAlt: t('products.hero.imageAlt'),
    designsLabel: t('products.hero.designsLabel'),
    fastDeliveryLabel: t('products.hero.fastDeliveryLabel')
  }

  return <ProductsHeroMotion strings={strings} />
}
