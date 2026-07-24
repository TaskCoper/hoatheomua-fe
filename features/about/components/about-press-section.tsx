'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { LinkSquare02Icon, News01Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'

const PRESS_MENTIONS = [
  {
    id: 'dongkhoi',
    href: 'https://baodongkhoi.vn/hoa-theo-mua-cua-hang-dat-hoa-hang-dau-tai-ho-chi-minh-02122024-a139172.html'
  },
  { id: 'tuyenquang', href: 'https://baotuyenquang.com.vn/hoa-theo-mua%C2%A0hoa-dep-la-hoa-no-dung-mua-203553.html' },
  { id: 'thanhhoa', href: 'https://baothanhhoa.vn/hoa-theo-mua-cua-hang-dat-hoa-tuoi-uy-tin-tai-tphcm-233829.htm' },
  { id: 'cantho', href: 'https://baocantho.com.vn/hoa-theo-mua-cua-hang-dat-hoa-8-3-uy-tin-tai-tp-hcm-a183299.html' },
  {
    id: 'depviet',
    href: 'https://depviet.net.vn/hoa-theo-mua-ra-mat-bo-suu-tap-lan-ho-diep-chung-tet-giap-thin-2024-134606'
  },
  {
    id: 'diendandoanhnghiep',
    href: 'https://diendandoanhnghiep.vn/hoa-theo-mua-khoi-nghiep-thanh-cong-nho-kinh-doanh-hoa-tuoi-10155786.html'
  },
  { id: 'vietbao', href: 'https://vietbao.vn/hoa-theo-mua-he-thong-hoa-tuoi-online-uy-tin-tai-tp-hcm-544869.html' },
  { id: 'quangninh', href: 'https://baoquangninh.vn/mau-thiet-ke-hoa-lan-doc-quyen-tai-hoa-theo-mua-3332769.html' },
  { id: 'tayninh', href: 'https://baotayninh.vn/dat-hoa-qua-tang-tai-hoa-theo-mua-nhanh-chong-tiet-kiem-a182597.html' }
] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const cardStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 16 } }
}

export default function PressSection() {
  const { t } = useTranslation()

  return (
    <section className='mt-8 sm:mt-10 md:mt-12 lg:mt-14 mb-4 sm:mb-6 md:mb-8 lg:mb-10'>
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 px-4'
      >
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {t('about.press.title')}
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {t('about.press.description')}
        </p>
      </motion.div>

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        variants={cardStagger}
        className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 px-4'
      >
        {PRESS_MENTIONS.map((press) => (
          <motion.a
            key={press.href}
            href={press.href}
            target='_blank'
            rel='noopener noreferrer'
            variants={cardItem}
            whileHover={{ y: -8, scale: 1.025, backgroundColor: 'rgba(188, 208, 199, 0.4)' }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className='group flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[0_0.4rem_1.2rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 hover:shadow-[0_1rem_2.5rem_rgb(81_108_108/16%)]'
          >
            <motion.div
              whileHover={{ rotate: -16, scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 380, damping: 12 }}
              className='grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/70 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'
            >
              <HugeiconsIcon icon={News01Icon} className='size-4' />
            </motion.div>

            <div className='min-w-0 flex-1 space-y-0.5'>
              <p className='truncate font-title text-xs font-bold text-primary sm:text-sm'>
                {t(`about.press.items.${press.id}.name`)}
              </p>
              <p className='line-clamp-2 text-[0.625rem] leading-snug text-foreground sm:text-[0.6875rem]'>
                {t(`about.press.items.${press.id}.headline`)}
              </p>
            </div>

            <motion.span
              whileHover={{ x: 5, y: -5, rotate: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 12 }}
              className='inline-flex'
            >
              <HugeiconsIcon
                icon={LinkSquare02Icon}
                className='size-3.5 shrink-0 text-foreground/40 transition-colors group-hover:text-primary'
                aria-hidden='true'
              />
            </motion.span>
          </motion.a>
        ))}
      </motion.div>

      <div className='mx-auto mt-5 flex w-full flex-col items-center gap-2 bg-secondary/50 px-5 py-5 text-center sm:mt-6 sm:gap-2.5 sm:py-6'>
        <motion.p
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className='font-title text-base font-bold text-primary sm:text-lg lg:text-xl'
        >
          {t('about.press.footer.thankYou')}
        </motion.p>

        <p className='max-w-2xl text-xs leading-relaxed text-foreground'>{t('about.press.footer.message')}</p>

        <motion.div
          whileHover={{ y: -5, scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14 }}
          className='group relative'
        >
          <motion.span
            aria-hidden='true'
            animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className='pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-primary/35 blur-xl'
          />
          <Button
            asChild
            size='lg'
            className='relative gap-2 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/22%)] ring-1 ring-primary/20 transition-shadow hover:shadow-[0_1rem_2.4rem_rgb(81_108_108/32%)]'
          >
            <Link href='/products'>
              <HugeiconsIcon
                icon={ShoppingBag01Icon}
                className='size-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125'
              />
              {t('about.press.footer.productsCta')}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
