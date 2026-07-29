'use client'

import OccasionBreadcrumb from '@/features/occasions/components/occasion-breadcrumb'
import OccasionHeroSection from '@/features/occasions/components/occasion-hero-section'
import OccasionProductsSection from '@/features/occasions/components/occasion-products-section'
import type { BaseCard, LocalizedText } from '@/types/config.type'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const FloatingPetals = dynamic(() => import('@/shared/components/floating-petals'), { ssr: false })

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
  promiseSection: ReactNode
}

export default function OccasionDetailContent({ card, badge, sections, promiseSection }: OccasionDetailContentProps) {
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

      {promiseSection}

      <FloatingPetals />
    </div>
  )
}
