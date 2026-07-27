'use client'

import OccasionCampaignBanner from '@/features/occasions/components/occasion-campaign-banner'
import ProductGrid from '@/features/products/components/product-grid'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import type { BaseCard, LocalizedText } from '@/types/config.type'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

interface OccasionProductsSectionProps {
  card: BaseCard
  categoryIds: number[]
  skuPrefix: string | null
  campaign: {
    name: LocalizedText
    startDate: string
    endDate: string
  } | null
  divider?: boolean
}

export default function OccasionProductsSection({
  card,
  categoryIds,
  skuPrefix,
  campaign,
  divider = false
}: OccasionProductsSectionProps) {
  const { t, locale } = useTranslation()
  const displayName = campaign ? campaign.name[locale] || campaign.name.vi || card.name[locale] : card.name[locale]
  const sectionId = campaign ? `occasion-products-${campaign.name.en || campaign.name.vi}` : 'occasion-products'
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX)

  return (
    <section id={sectionId} className='relative mt-8 scroll-mt-8 px-4 sm:mt-10 md:mt-12 lg:mt-14'>
      {divider ? (
        <div aria-hidden='true' className='mx-auto mb-8 h-px w-full max-w-7xl bg-foreground/10 sm:mb-10 lg:mb-12' />
      ) : null}

      {campaign ? (
        <div className='mx-auto w-full max-w-7xl px-2'>
          <OccasionCampaignBanner
            campaignName={campaign.name}
            startDate={campaign.startDate}
            endDate={campaign.endDate}
          />
        </div>
      ) : null}

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto mt-4 w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('products.occasions.detail.products.title', { name: displayName })}
          </h2>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('products.occasions.detail.products.description')}
        </p>
      </motion.div>

      <div className='mx-auto mt-6 w-full max-w-7xl'>
        {!skuPrefix && categoryIds.length === 0 ? (
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            className='mx-auto mt-4 flex w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-3xl bg-secondary/40 px-6 py-14 text-center ring-1 ring-foreground/5'
          >
            <div className='flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm'>
              <HugeiconsIcon icon={FlowerIcon} className='size-7' />
            </div>
            <p className='font-title text-lg font-semibold text-primary'>
              {t('products.occasions.detail.products.empty.title')}
            </p>
            <p className='max-w-md text-sm text-muted-foreground'>
              {t('products.occasions.detail.products.empty.description')}
            </p>
          </motion.div>
        ) : (
          <ProductGrid
            categoryIds={categoryIds.map(String)}
            search={skuPrefix ?? ''}
            page={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  )
}
