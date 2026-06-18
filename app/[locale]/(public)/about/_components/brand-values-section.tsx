'use client'

import leftBranch from '@/public/images/left-branch.png'
import { Diamond01Icon, Flag03Icon, HappyIcon, Leaf01Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import { SparkleDivider } from '../../_components/sparkle-dividier'

const BRAND_VALUES = [
  {
    number: '01',
    icon: HappyIcon,
    title: 'Enjoy Cuộc Sống',
    description:
      'Hoa Theo Mùa không chỉ mang hoa mà còn gửi gắm những giá trị tích cực để bạn cảm nhận vẻ đẹp và lắng nghe sự bình yên trong tâm hồn. Tận hưởng từng bông hoa là cách để bạn trân trọng cuộc sống và tìm thấy niềm vui riêng.'
  },
  {
    number: '02',
    icon: Leaf01Icon,
    title: 'Thân Thiện Môi Trường',
    description:
      'Chúng tôi dùng chất liệu tự nhiên như rổ mây, giỏ tre, giấy kraft… giúp giảm thiểu nhựa và tạo nên sản phẩm vừa đẹp, vừa giữ gìn môi trường.'
  },
  {
    number: '03',
    icon: SparklesIcon,
    title: 'Tinh Tế',
    description:
      'Hoa Theo Mùa hiểu và tôn vinh vẻ đẹp của hoa dành cho tâm hồn người phụ nữ. Chăm chút từng chi tiết, mang đến cảm giác đồng điệu và yêu thương.'
  },
  {
    number: '04',
    icon: Diamond01Icon,
    title: 'Đơn Giản',
    description:
      'Lấy cảm hứng từ vẻ đẹp tự nhiên — chất liệu mộc mạc, sắc màu nhẹ nhàng, tôn vinh vẻ đẹp chân thật của hoa.'
  },
  {
    number: '05',
    icon: Flag03Icon,
    title: 'Trân Trọng Giá Trị Việt',
    description:
      'Chúng tôi trân trọng và tôn vinh vẻ đẹp Việt: từ những mùa hoa, làng nghề, đến các sản phẩm sáng tạo mang dấu ấn văn hóa Việt Nam.'
  }
]

const [featuredValue, ...restValues] = BRAND_VALUES

const EASE = [0.22, 0.61, 0.36, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -44, scale: 0.94 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 16 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 16 } }
}

export default function BrandValuesSection() {
  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
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

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            Giá Trị Chúng Tôi Hướng Đến
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          Từ những mong muốn mang đến cảm xúc bình yên ấy, Hoa Theo Mùa đã đúc kết nên năm giá trị cốt lõi — những điều
          tốt đẹp được gửi trao trong từng sản phẩm đến tay khách hàng.
        </p>
      </motion.div>

      <Image
        src={leftBranch}
        alt='Cành lá trang trí'
        className='wind-wiggle-left absolute -left-8 top-0 h-56 w-auto opacity-30 hidden lg:block pointer-events-none'
        aria-hidden='true'
      />

      <div className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-5'>
        <motion.article
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={slideInLeft}
          whileHover={{ y: -8, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className='group relative flex h-full self-stretch flex-col gap-3 overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_0.8rem_2rem_rgb(81_108_108/16%)] sm:p-6 lg:col-span-5'
        >
          {/* Image 3 — seamless botanical tile over the solid sage card; absent file = no overlay. */}
          <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 opacity-10'
            style={{
              backgroundImage: "url('/images/about/botanical-pattern-sage.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '16rem'
            }}
          />

          <motion.span
            aria-hidden='true'
            animate={{ rotate: [0, 12, 0, -4, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className='pointer-events-none absolute -right-6 -bottom-6 font-title text-[10rem] font-bold leading-none text-primary-foreground/8 sm:-right-8 sm:-bottom-8 sm:text-[12rem]'
          >
            {featuredValue.number}
          </motion.span>

          <div className='relative flex items-center gap-2.5'>
            <motion.div
              whileHover={{ rotate: -16, scale: 1.18 }}
              animate={{ y: [0, -3, 0] }}
              transition={{
                rotate: { type: 'spring', stiffness: 380, damping: 12 },
                scale: { type: 'spring', stiffness: 380, damping: 12 },
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              }}
              className='grid size-10 place-items-center rounded-xl bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20 sm:size-12'
            >
              <HugeiconsIcon icon={featuredValue.icon} className='size-5 sm:size-6' />
            </motion.div>
            <span className='font-title text-2xl font-bold leading-none text-primary-foreground/40 sm:text-3xl'>
              {featuredValue.number}
            </span>
          </div>

          <div className='relative space-y-1.5'>
            <p className='text-[0.625rem] font-bold uppercase tracking-widest text-primary-foreground/70'>
              Giá Trị Cốt Lõi
            </p>
            <h2 className='font-title text-xl font-bold leading-tight sm:text-2xl lg:text-3xl'>
              {featuredValue.title}
            </h2>
            <p className='text-xs leading-relaxed text-primary-foreground/90 sm:text-sm'>{featuredValue.description}</p>
          </div>
        </motion.article>

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-60px' }}
          variants={cardStagger}
          className='grid h-full self-stretch grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-7 lg:grid-rows-2'
        >
          {restValues.map((value) => (
            <motion.article
              key={value.number}
              variants={cardItem}
              whileHover={{ y: -8, scale: 1.025 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className='group relative flex flex-col gap-2 overflow-hidden rounded-3xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:p-5'
            >
              <motion.span
                aria-hidden='true'
                whileHover={{ scale: 1.15, rotate: 4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                className='pointer-events-none absolute right-2 -top-1 font-title text-5xl font-bold leading-none text-secondary/40 transition-colors group-hover:text-secondary/70 sm:right-2 sm:-top-2 sm:text-6xl'
              >
                {value.number}
              </motion.span>

              <motion.div
                whileHover={{ rotate: -14, scale: 1.18 }}
                transition={{ type: 'spring', stiffness: 380, damping: 12 }}
                className='relative grid size-10 place-items-center rounded-xl bg-secondary/70 text-primary shadow-sm ring-1 ring-primary/10'
              >
                <HugeiconsIcon icon={value.icon} className='size-5' />
              </motion.div>

              <div className='relative space-y-1'>
                <h2 className='font-title text-base font-bold leading-tight text-primary lg:text-lg'>{value.title}</h2>
                <p className='text-xs leading-relaxed text-foreground'>{value.description}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
