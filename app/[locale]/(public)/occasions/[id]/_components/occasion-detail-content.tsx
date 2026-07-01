'use client'

import type { BaseCard, LocalizedText } from '@/types/config.type'
import dynamic from 'next/dynamic'
import ProductsPromiseSection from '../../../products/_components/products-promise-section'
import OccasionBreadcrumb from './occasion-breadcrumb'
import OccasionHeroSection from './occasion-hero-section'
import OccasionProductsSection from './occasion-products-section'

const FloatingPetals = dynamic(() => import('../../../_components/floating-petals'), { ssr: false })

export interface OccasionSection {
  key: string
  categoryIds: number[]
  skuPrefix: string | null
  campaign: {
    name: LocalizedText
    startDate: string
    endDate: string
  } | null
}

interface OccasionDetailContentProps {
  card: BaseCard
  badge: LocalizedText
  sections: OccasionSection[]
}

export default function OccasionDetailContent({ card, badge, sections }: OccasionDetailContentProps) {
  return (
    <div className='relative overflow-hidden'>
      <section className='relative px-4 pt-4 sm:px-6 lg:px-10 lg:pt-8 xl:px-16'>
        <div className='mx-auto w-full max-w-7xl'>
          <OccasionBreadcrumb card={card} />
        </div>
      </section>

      <OccasionHeroSection card={card} badge={badge} />

      {sections.map((section, index) => (
        <OccasionProductsSection
          key={section.key}
          card={card}
          categoryIds={section.categoryIds}
          skuPrefix={section.skuPrefix}
          campaign={section.campaign}
          divider={index > 0}
        />
      ))}

      <ProductsPromiseSection />

      <FloatingPetals />
    </div>
  )
}
