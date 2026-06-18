'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { FlowerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function ProductGridEmpty() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      className='mx-auto mt-10 flex w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-3xl bg-secondary/40 px-6 py-14 text-center ring-1 ring-foreground/5'
    >
      <div className='flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm'>
        <HugeiconsIcon icon={FlowerIcon} className='size-7' />
      </div>
      <p className='font-title text-lg font-semibold text-primary'>{t('products.grid.empty.title')}</p>
      <p className='max-w-md text-sm text-muted-foreground'>{t('products.grid.empty.description')}</p>
    </motion.div>
  )
}
