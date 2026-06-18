'use client'

import { motion, type Variants } from 'motion/react'
import FlowersCarousel from './flowers-carousel'
import { SparkleDivider } from './sparkle-dividier'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

export default function ShopFreshFlowersSection() {
  return (
    <div className='mt-4 sm:mt-6 md:mt-8 lg:mt-10 overflow-hidden px-4'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>Mua Hoa Tươi</h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          Khám phá bộ sưu tập hoa tươi được tuyển chọn kỹ lưỡng, sắp đặt tinh tế bởi những nghệ nhân chuyên nghiệp, mang
          đến vẻ đẹp, hương thơm và sự thanh lịch trường tồn ngay tận cửa nhà bạn.
        </p>
      </motion.div>

      <FlowersCarousel />
    </div>
  )
}
