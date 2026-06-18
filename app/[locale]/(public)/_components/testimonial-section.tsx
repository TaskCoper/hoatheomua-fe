'use client'

import { QuoteUpIcon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
}

const starPop: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -90 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 420, damping: 10, delay: 0.45 + i * 0.08 }
  })
}

export default function TestimonialSection() {
  return (
    <motion.div
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-80px' }}
      variants={containerStagger}
      className='relative bg-secondary pt-4 pb-8 overflow-hidden'
    >
      <motion.div
        animate={{ rotate: [0, -8, 0, 6, 0], scale: [1, 1.08, 1, 1.04, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className='pointer-events-none absolute -left-4 top-2 sm:left-8 sm:top-4'
        aria-hidden='true'
      >
        <HugeiconsIcon icon={QuoteUpIcon} className='size-16 text-card/60 sm:size-24' />
      </motion.div>

      <div className='mx-auto w-full max-w-7xl space-y-4 px-4 py-4 relative'>
        <motion.h1
          variants={fadeUp}
          className='text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'
        >
          Khách Hàng Nói Gì
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className='mx-auto max-w-4xl text-justify text-xs sm:text-sm leading-relaxed text-foreground'
        >
          Tôi hiếm khi viết đánh giá, nhưng trải nghiệm này thực sự xứng đáng. Tôi đặt một bó hoa cho sinh nhật mẹ và
          mong muốn mọi thứ đều thật hoàn hảo. Ngay từ lúc đặt hàng, tôi đã được cập nhật tình trạng giao nhận liên tục,
          điều đó khiến tôi rất yên tâm. Khi hoa được giao đến, chúng còn đẹp hơn cả những gì tôi tưởng tượng – tươi
          mới, rực rỡ và được cắm vô cùng tinh tế. Mẹ tôi thực sự xúc động khi nhận được. Cảm ơn shop đã biến một món
          quà giản dị thành khoảnh khắc đáng nhớ cho gia đình tôi.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className='mx-auto flex w-full max-w-4xl justify-between gap-4 flex-row items-center'
        >
          <motion.div
            whileHover={{ x: 4, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
            className='border-l-2 border-primary pl-2'
          >
            <p className='font-medium text-xs sm:text-sm text-primary'>Nguyễn Thị Mai</p>
            <p className='text-[0.625rem] sm:text-xs text-muted-foreground'>Quản Lý Sự Kiện</p>
          </motion.div>

          <div className='flex items-center gap-1'>
            {Array.from({ length: 5 }).map((_, index) => (
              <motion.span
                key={index}
                custom={index}
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true }}
                variants={starPop}
                whileHover={{ scale: 1.4, rotate: 16 }}
                className='inline-flex'
              >
                <HugeiconsIcon icon={StarIcon} className='size-3 sm:size-4 fill-orange-400 text-orange-400' />
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
