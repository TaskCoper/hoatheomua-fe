'use client'

import ProductGrid from '@/features/products/components/product-grid'
import { WOMEN_DAY_CATEGORY_IDS, WOMEN_DAY_PAGE_SIZE } from '@/features/women-day-20-10/constants'
import { fadeUp, stagger } from '@/features/women-day-20-10/motion'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import { useState } from 'react'

const COLLECTION_ANCHOR = '#collection'

export default function WomenDayCollectionSection() {
  const { t } = useTranslation()
  const [page, setPage] = useState(DEFAULT_PAGE_INDEX)

  return (
    <section id='collection' className='scroll-mt-header px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
      <motion.div initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-80px' }} variants={stagger} className='mx-auto max-w-3xl text-center'>
        <motion.p variants={fadeUp} className='text-xs font-bold tracking-[0.2em] text-primary uppercase'>{t('womenDay.collection.eyebrow')}</motion.p>
        <motion.h2 variants={fadeUp} className='mt-2 font-title text-3xl font-bold text-primary sm:text-4xl'>{t('womenDay.collection.title')}</motion.h2>
        <motion.p variants={fadeUp} className='mt-3 text-sm leading-relaxed text-foreground sm:text-base'>{t('womenDay.collection.intro')}</motion.p>
      </motion.div>
      <motion.div initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-60px' }} variants={fadeUp} className='mx-auto mt-8 max-w-7xl rounded-3xl bg-card/70 p-4 shadow-[0_0.8rem_2rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:p-6'>
        <div className='mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4'>
          <div><h3 className='font-title text-xl font-bold text-primary sm:text-2xl'>{t('womenDay.collection.productsTitle')}</h3><p className='mt-1 text-xs text-muted-foreground sm:text-sm'>{t('womenDay.collection.productsIntro')}</p></div>
          <Link href='/products' className='inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform hover:translate-x-1 sm:text-sm'>{t('womenDay.collection.readMore')}<HugeiconsIcon icon={ArrowRight01Icon} className='size-4' /></Link>
        </div>
        <ProductGrid categoryIds={WOMEN_DAY_CATEGORY_IDS} pageSize={WOMEN_DAY_PAGE_SIZE} page={page} onPageChange={setPage} pageHref={() => COLLECTION_ANCHOR} columnsClassName='[grid-template-columns:repeat(auto-fill,minmax(min(8.5rem,100%),1fr))] sm:grid-cols-2 lg:grid-cols-5' />
      </motion.div>
    </section>
  )
}
