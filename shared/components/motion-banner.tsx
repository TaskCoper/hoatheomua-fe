'use client'

import { motion } from 'motion/react'
import Image, { type StaticImageData } from 'next/image'

type MotionBannerProps = {
  src: StaticImageData
  alt: string
  className?: string
}

export default function MotionBanner({ src, alt, className }: MotionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      className='mx-auto w-full max-w-7xl px-4 mt-4 sm:mt-6 md:mt-8 lg:mt-10'
    >
      <Image src={src} alt={alt} className={className} />
    </motion.div>
  )
}
