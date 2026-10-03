'use client'

import { Button } from '@/components/ui/button'
import WomenDayProductsSection from '@/features/women-day-20-10/components/women-day-products-section'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import vietnameseWomensDay from '@/public/images/about/bg-product-vietnamese-womens-day.png'
import womensDay from '@/public/images/about/bg-product-womens-day.png'
import flower from '@/public/images/about-avatar.png'
import ctaFloralCluster from '@/public/images/bg-news-1.png'
import ctaCornerFlower from '@/public/images/DownLeftCorner-removebg-preview.png'
import newsFlowerOne from '@/public/images/10.webp'
import newsFlowerTwo from '@/public/images/11.webp'
import newsFlowerThree from '@/public/images/2.webp'
import newsFlowerFour from '@/public/images/3.webp'
import petalOne from '@/public/images/petal-1.png'
import petalTwo from '@/public/images/petal-2.png'
import petalThree from '@/public/images/petal-3.png'
import { ArrowDown01Icon, ArrowRight01Icon, Calendar03Icon, Flower2Icon, GiftIcon, HeartCheckIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import type { ReactNode } from 'react'

const NEWS_IMAGES = [newsFlowerOne, newsFlowerTwo, newsFlowerThree, newsFlowerFour] as const

const NEWS_ARTICLES = {
  vi: [
    {
      date: '15 tháng 10, 2026',
      author: 'Hoa Theo Mùa',
      title: '20/10 — dịp để nói lời cảm ơn bằng những điều thật dịu dàng',
      lead: 'Một bó hoa không thay cho tất cả yêu thương, nhưng có thể bắt đầu một cuộc trò chuyện đẹp.',
      body: 'Ngày Phụ nữ Việt Nam là lời nhắc để ta dừng lại một chút, nhớ về những người phụ nữ đã làm cuộc sống của mình trở nên ấm áp hơn.'
    },
    {
      date: '16 tháng 10, 2026',
      author: 'Hoa Theo Mùa',
      title: 'Tặng mẹ một mùa hoa của lòng biết ơn',
      lead: 'Với mẹ, món quà đẹp nhất luôn bắt đầu từ sự quan tâm thật lòng.',
      body: 'Hãy chọn những sắc hoa ấm áp, thanh nhã và gửi kèm một lời nhắn nhỏ — đôi khi chỉ vậy cũng đủ làm ngày của mẹ trở nên đặc biệt.'
    },
    {
      date: '17 tháng 10, 2026',
      author: 'Hoa Theo Mùa',
      title: 'Chọn hoa theo điều bạn muốn nói',
      lead: 'Mỗi sắc hoa mang một nhịp cảm xúc riêng: dịu dàng, rạng rỡ, sâu sắc hay nồng nhiệt.',
      body: 'Nếu chưa biết bắt đầu từ đâu, hãy nghĩ về tính cách của người nhận. Một thiết kế đúng với nàng luôn đáng nhớ hơn một món quà thật lớn.'
    },
    {
      date: '18 tháng 10, 2026',
      author: 'Hoa Theo Mùa',
      title: 'Một lời chúc đẹp cũng cần một cách trao thật đẹp',
      lead: 'Từ cành hoa đầu tiên đến tấm thiệp nhỏ, từng chi tiết đều là một phần của lời yêu thương.',
      body: 'Hoa Theo Mùa chuẩn bị từng bó hoa trong ngày, gói ghém cẩn thận và giao tận nơi để cảm xúc của bạn đến tay người nhận thật trọn vẹn.'
    }
  ],
  en: [
    {
      date: 'October 15, 2026',
      author: 'Hoa Theo Mùa',
      title: '20/10 — a gentle reason to say thank you',
      lead: 'Flowers cannot say everything for us, but they can begin a beautiful conversation.',
      body: 'Vietnamese Women’s Day is a small invitation to pause and remember the women who make our everyday life warmer.'
    },
    {
      date: 'October 16, 2026',
      author: 'Hoa Theo Mùa',
      title: 'A season of gratitude for mother',
      lead: 'For mother, the most beautiful gift often begins with a thoughtful gesture.',
      body: 'Choose warm, graceful flowers and pair them with a small note — sometimes that is all it takes to make her day feel special.'
    },
    {
      date: 'October 17, 2026',
      author: 'Hoa Theo Mùa',
      title: 'Choose flowers by what you want to say',
      lead: 'Every color carries its own feeling: soft, bright, heartfelt or romantic.',
      body: 'When you are unsure where to begin, think about the person receiving the flowers. A design that feels like her is always memorable.'
    },
    {
      date: 'October 18, 2026',
      author: 'Hoa Theo Mùa',
      title: 'A beautiful wish deserves a beautiful delivery',
      lead: 'From the first stem to the little note, every detail becomes part of your message.',
      body: 'Hoa Theo Mùa prepares each bouquet with care and delivers it across the city, so your feeling arrives beautifully.'
    }
  ]
} as const

const COPY = {
  vi: {
    eyebrow: 'Bộ sưu tập đặc biệt · 20 tháng 10',
    title: 'Gửi một mùa thương đến những người phụ nữ mình yêu',
    intro:
      'Một bó hoa dịu dàng cho mẹ, một sắc hoa thật riêng cho người thương, hay một lời cảm ơn gửi đến người đồng hành cùng bạn mỗi ngày.',
    primary: 'Chọn hoa tặng nàng',
    secondary: 'Xem cách chọn hoa',
    dateMark: '20 · 10',
    brandLine: 'Hoa tươi',
    brandLabel: 'theo mùa',
    seasonsLabel: 'mùa hoa',
    naturalLabel: 'tự nhiên',
    founded: 'Thành lập 12/11/2020',
    collectionEyebrow: 'Những đóa hoa dành riêng cho nàng',
    collectionTitle: 'Trao hoa, trao điều chưa nói',
    collectionIntro: 'Các thiết kế được tuyển chọn theo sắc hoa, cảm xúc và người nhận — để món quà của bạn vừa đẹp vừa thật lòng.',
    productsTitle: 'Bộ sưu tập 20/10',
    productsIntro: 'Hoa tươi theo mùa, được bó thủ công và giao tận nơi tại TP.HCM.',
    newsEyebrow: 'Một ngày để nhớ',
    newsTitle: '20/10 — dịp để nói lời cảm ơn bằng những điều thật dịu dàng',
    newsText1: 'Ngày Phụ nữ Việt Nam là lời nhắc để ta dừng lại một chút, nhớ về những người phụ nữ đã làm cuộc sống của mình trở nên ấm áp hơn.',
    newsText2: 'Một bó hoa không thay cho tất cả yêu thương, nhưng có thể bắt đầu một cuộc trò chuyện đẹp — bằng một sắc hoa nàng thích và một lời nhắn thật lòng.',
    guideTitle: 'Chọn hoa theo điều bạn muốn nói',
    guideIntro: 'Mỗi người phụ nữ là một mùa hoa riêng. Hãy bắt đầu từ câu chuyện của người bạn muốn tặng.',
    mother: 'Tặng mẹ',
    motherText: 'Nhẹ nhàng, ấm áp và đầy biết ơn.',
    lover: 'Tặng người thương',
    loverText: 'Lãng mạn, tinh tế, chỉ dành riêng cho nàng.',
    colleague: 'Tặng chị em, đồng nghiệp',
    colleagueText: 'Tươi sáng, thanh lịch và nhiều năng lượng.',
    promiseEyebrow: 'Hoa Theo Mùa gửi bạn',
    promiseTitle: 'Để lời yêu thương đến nơi thật đẹp',
    promiseText: 'Từ những cành hoa được chọn trong ngày đến cách gói ghém cuối cùng, mọi chi tiết đều được chăm chút như một lời nhắn gửi.',
    order: 'Đặt hoa ngay',
    readMore: 'Khám phá thêm'
  },
  en: {
    eyebrow: 'Special collection · Vietnamese Women’s Day',
    title: 'A little season of love for the women you cherish',
    intro: 'A gentle bouquet for mother, a signature bloom for someone special, or a thank-you for the woman beside you every day.',
    primary: 'Shop the collection',
    secondary: 'Find your flowers',
    dateMark: '20 · 10',
    brandLine: 'fresh flowers',
    brandLabel: 'in season',
    seasonsLabel: 'seasons',
    naturalLabel: 'natural',
    founded: 'Founded 12/11/2020',
    collectionEyebrow: 'Flowers made for her',
    collectionTitle: 'Say what flowers cannot leave unsaid',
    collectionIntro: 'Seasonal designs selected by color, feeling and recipient — so your gift feels as thoughtful as it is beautiful.',
    productsTitle: 'The 20/10 collection',
    productsIntro: 'Fresh seasonal flowers, hand-tied and delivered across Ho Chi Minh City.',
    newsEyebrow: 'A day worth remembering',
    newsTitle: '20/10 — a gentle reason to say thank you',
    newsText1: 'Vietnamese Women’s Day is a small invitation to pause and remember the women who make our everyday life warmer.',
    newsText2: 'Flowers cannot say everything for us, but they can begin a beautiful conversation — with a color she loves and a note from the heart.',
    guideTitle: 'Choose flowers by feeling',
    guideIntro: 'Every woman has her own season. Begin with the story of the person you are gifting.',
    mother: 'For mother',
    motherText: 'Soft, warm and full of gratitude.',
    lover: 'For someone special',
    loverText: 'Romantic, refined and made just for her.',
    colleague: 'For sisters & colleagues',
    colleagueText: 'Bright, graceful and full of energy.',
    promiseEyebrow: 'A note from Hoa Theo Mùa',
    promiseTitle: 'Let your feeling arrive beautifully',
    promiseText: 'From flowers selected that day to the final wrap, every detail is cared for like a personal message.',
    order: 'Order flowers',
    readMore: 'Explore more'
  }
} as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
}

export default function WomenDayPage({ testimonials }: { testimonials: ReactNode }) {
  const { locale } = useTranslation()
  const copy = COPY[locale]
  const articles = locale === 'vi' ? NEWS_ARTICLES.vi : NEWS_ARTICLES.en

  return (
    <div className='relative isolate overflow-hidden'>
      <motion.section
        initial='hidden'
        animate='visible'
        variants={stagger}
        className='relative mx-4 mt-4 overflow-hidden rounded-[2rem] bg-secondary/35 shadow-[0_1rem_3rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 sm:mx-6 sm:mt-6 lg:mx-auto lg:max-w-7xl'
      >
        <Image
          src={vietnameseWomensDay}
          alt=''
          fill
          priority
          sizes='(min-width: 1280px) 1280px, 100vw'
          className='pointer-events-none -z-10 object-cover opacity-75'
        />
        <div className='absolute inset-0 -z-10 bg-linear-to-r from-background/95 via-background/75 to-background/15' />

        <div className='grid min-h-[38rem] items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-16'>
          <motion.div variants={stagger} className='max-w-xl space-y-5'>
            <motion.p variants={fadeUp} className='font-title text-sm font-bold tracking-[0.18em] text-primary uppercase'>
              {copy.eyebrow}
            </motion.p>
            <motion.h1 variants={fadeUp} className='font-title text-4xl leading-[1.08] font-bold text-primary sm:text-5xl lg:text-6xl'>
              {copy.title}
            </motion.h1>
            <motion.p variants={fadeUp} className='max-w-lg text-sm leading-relaxed text-foreground sm:text-base'>
              {copy.intro}
            </motion.p>
            <motion.div variants={fadeUp} className='flex flex-wrap gap-3 pt-1'>
              <Button asChild size='lg' className='gap-2 shadow-[0_0.7rem_1.5rem_rgb(81_108_108/22%)]'>
                <Link href='#collection'>
                  <HugeiconsIcon icon={GiftIcon} className='size-4' />
                  {copy.primary}
                </Link>
              </Button>
              <Button asChild size='lg' variant='outline' className='bg-card/75 text-primary backdrop-blur-sm'>
                <Link href='#guide'>{copy.secondary}</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className='relative mx-auto flex w-full max-w-md justify-center lg:max-w-none'>
            <div aria-hidden='true' className='absolute inset-0 m-auto size-64 rounded-full bg-primary/15 blur-3xl sm:size-80' />
            <div className='bob-tilt-lg relative size-64 overflow-hidden rounded-full bg-card/80 shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] ring-8 ring-card/60 sm:size-80'>
              <div aria-hidden='true' className='spin-loop absolute inset-3 z-10 rounded-full border border-dashed border-primary/20' />
              <div className='sway-soft absolute inset-0'>
                <Image src={flower} alt='' fill sizes='20rem' className='object-cover object-center' />
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.55 }}
              whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
              whileTap={{ scale: 0.96 }}
              className='absolute -top-1 right-2 hidden rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 sm:block'
            >
              <span className='block font-title text-base font-bold leading-none text-primary'>12</span>
              <span className='block text-[0.5rem] font-semibold tracking-widest text-muted-foreground uppercase'>{copy.seasonsLabel}</span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.3, rotate: 45 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.75 }}
              whileHover={{ rotate: 0, scale: 1.12, y: -4 }}
              whileTap={{ scale: 0.96 }}
              className='absolute top-1/2 -left-2 hidden -translate-y-1/2 rounded-xl bg-card px-2.5 py-1.5 text-center shadow-md ring-1 ring-foreground/5 lg:block'
            >
              <span className='block font-title text-sm font-bold leading-none text-leaf'>100%</span>
              <span className='block text-[0.5rem] font-semibold tracking-widest text-muted-foreground uppercase'>{copy.naturalLabel}</span>
            </motion.span>
            <motion.span
              whileHover={{ y: -4, scale: 1.12 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='absolute right-1 top-14 rounded-full bg-primary px-3 py-1.5 font-title text-xs font-bold text-primary-foreground shadow-md sm:right-5 sm:top-16'
            >
              {copy.dateMark}
            </motion.span>
            <motion.span
              whileHover={{ y: -4, scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className='absolute bottom-2 left-2 rounded-2xl bg-card/90 px-3 py-2 text-center shadow-md ring-1 ring-foreground/5 backdrop-blur-sm sm:left-0'
            >
              <span className='block font-title text-lg font-bold text-primary'>{copy.brandLine}</span>
              <span className='block text-[0.6rem] font-semibold tracking-widest text-muted-foreground uppercase'>{copy.brandLabel}</span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.45 }}
              whileHover={{ y: -4, scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              className='absolute -bottom-1 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[0.625rem] font-semibold text-primary-foreground shadow-md sm:bottom-0'
            >
              <HugeiconsIcon icon={Calendar03Icon} className='size-3.5' />
              {copy.founded}
            </motion.span>
          </motion.div>
        </div>
      </motion.section>

      <section id='collection' className='scroll-mt-header px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
        <motion.div initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-80px' }} variants={stagger} className='mx-auto max-w-3xl text-center'>
          <motion.p variants={fadeUp} className='text-xs font-bold tracking-[0.2em] text-primary uppercase'>{copy.collectionEyebrow}</motion.p>
          <motion.h2 variants={fadeUp} className='mt-2 font-title text-3xl font-bold text-primary sm:text-4xl'>{copy.collectionTitle}</motion.h2>
          <motion.p variants={fadeUp} className='mt-3 text-sm leading-relaxed text-foreground sm:text-base'>{copy.collectionIntro}</motion.p>
        </motion.div>

        <motion.div initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-60px' }} variants={fadeUp} className='mx-auto mt-8 max-w-7xl rounded-3xl bg-card/70 p-4 shadow-[0_0.8rem_2rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:p-6'>
          <div className='mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4'>
            <div>
              <h3 className='font-title text-xl font-bold text-primary sm:text-2xl'>{copy.productsTitle}</h3>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>{copy.productsIntro}</p>
            </div>
            <Link href='/products' className='inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform hover:translate-x-1 sm:text-sm'>
              {copy.readMore}<HugeiconsIcon icon={ArrowRight01Icon} className='size-4' />
            </Link>
          </div>
          <WomenDayProductsSection />
        </motion.div>
      </section>

      <section className='px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
        <motion.div initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-80px' }} variants={stagger} className='mx-auto max-w-3xl text-center'>
          <motion.p variants={fadeUp} className='text-xs font-bold tracking-[0.2em] text-primary uppercase'>{copy.newsEyebrow}</motion.p>
          <motion.h2 variants={fadeUp} className='mt-2 font-title text-3xl leading-tight font-bold text-primary sm:text-4xl'>{copy.newsTitle}</motion.h2>
          <motion.p variants={fadeUp} className='mt-3 text-sm leading-relaxed text-foreground sm:text-base'>{copy.newsText1}</motion.p>
        </motion.div>

        <div className='mx-auto mt-10 max-w-5xl space-y-8'>
          {articles.map((article, index) => (
            <motion.article
              key={article.title}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className='grid overflow-hidden rounded-3xl bg-card shadow-[0_0.8rem_2rem_rgb(81_108_108/9%)] ring-1 ring-foreground/5 lg:grid-cols-2'
            >
              <motion.div variants={fadeUp} className={`relative min-h-64 overflow-hidden bg-secondary/25 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <Image src={NEWS_IMAGES[index]} alt={article.title} fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-contain p-8 transition-transform duration-700 hover:scale-105' />
              </motion.div>
              <motion.div variants={fadeUp} className={`flex flex-col justify-center p-6 sm:p-8 lg:p-10 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <p className='text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase'>{article.date} · {article.author}</p>
                <h3 className='mt-3 font-title text-2xl leading-tight font-bold text-primary sm:text-3xl'>{article.title}</h3>
                <div className='mt-5 rounded-2xl bg-secondary/35 p-4 text-sm italic leading-relaxed text-foreground'>{article.lead}</div>
                <p className='mt-5 text-sm leading-relaxed text-foreground'>{article.body}</p>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id='guide' className='scroll-mt-header relative overflow-hidden bg-secondary/45 px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
        <Image src={womensDay} alt='' fill sizes='100vw' className='pointer-events-none object-cover opacity-20' />
        <div className='relative mx-auto max-w-7xl'>
          <motion.div initial='hidden' whileInView='visible' viewport={{ once: true }} variants={stagger} className='mx-auto max-w-2xl text-center'>
            <motion.p variants={fadeUp} className='text-xs font-bold tracking-[0.2em] text-primary uppercase'>{copy.collectionEyebrow}</motion.p>
            <motion.h2 variants={fadeUp} className='mt-2 font-title text-3xl font-bold text-primary sm:text-4xl'>{copy.guideTitle}</motion.h2>
            <motion.p variants={fadeUp} className='mt-3 text-sm leading-relaxed text-foreground sm:text-base'>{copy.guideIntro}</motion.p>
          </motion.div>

          <div className='mt-8 grid gap-4 md:grid-cols-3'>
            <GuideCard icon={HeartCheckIcon} title={copy.mother} text={copy.motherText} />
            <GuideCard icon={Flower2Icon} title={copy.lover} text={copy.loverText} />
            <GuideCard icon={SparklesIcon} title={copy.colleague} text={copy.colleagueText} />
          </div>
        </div>
      </section>

      <section className='px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
        <div className='relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] bg-primary px-6 py-10 text-primary-foreground shadow-[0_1rem_3rem_rgb(81_108_108/22%)] sm:px-10 lg:grid-cols-[1fr_auto] lg:px-16'>
          <Image src={ctaFloralCluster} alt='' width={500} height={500} className='pointer-events-none absolute -right-20 -bottom-36 z-0 w-72 max-w-none opacity-35 sm:-right-10 sm:-bottom-44 sm:w-96' />
          <Image src={ctaCornerFlower} alt='' width={500} height={500} className='pointer-events-none absolute -bottom-28 -left-20 z-0 w-64 max-w-none opacity-25 sm:-bottom-36 sm:-left-8 sm:w-80' />
          <Image src={petalOne} alt='' width={100} height={100} className='wind-wiggle-left pointer-events-none absolute -top-8 right-16 z-0 size-20 object-contain opacity-25 sm:size-28' />
          <Image src={petalTwo} alt='' width={100} height={100} className='wind-wiggle-right pointer-events-none absolute -bottom-8 left-8 z-0 size-20 object-contain opacity-20 sm:size-28' />
          <Image src={petalThree} alt='' width={80} height={80} className='wind-wiggle-left pointer-events-none absolute right-1/3 bottom-2 z-0 size-12 object-contain opacity-20 sm:size-16' />
          <div className='relative z-10 max-w-2xl'>
            <p className='text-xs font-bold tracking-[0.2em] text-primary-foreground/70 uppercase'>{copy.promiseEyebrow}</p>
            <h2 className='mt-2 font-title text-3xl leading-tight font-bold text-primary-foreground sm:text-4xl'>{copy.promiseTitle}</h2>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base'>{copy.promiseText}</p>
          </div>
          <Button asChild size='lg' variant='secondary' className='relative z-10 w-fit gap-2 shadow-lg'>
            <Link href='/products'><HugeiconsIcon icon={GiftIcon} className='size-4' />{copy.order}</Link>
          </Button>
        </div>
      </section>

      <section className='relative overflow-hidden'>
        {testimonials}
      </section>

      <a href='#collection' aria-label={copy.primary} className='fixed right-4 bottom-5 z-20 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:-translate-y-1 sm:right-6'>
        <HugeiconsIcon icon={ArrowDown01Icon} className='size-5' />
      </a>
    </div>
  )
}

function GuideCard({ icon, title, text }: { icon: typeof HeartCheckIcon; title: string; text: string }) {
  return (
    <motion.article whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 18 }} className='rounded-3xl bg-card/90 p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 backdrop-blur-sm'>
      <div className='grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md'><HugeiconsIcon icon={icon} className='size-5' /></div>
      <h3 className='mt-4 font-title text-xl font-bold text-primary'>{title}</h3>
      <p className='mt-1 text-sm leading-relaxed text-foreground'>{text}</p>
    </motion.article>
  )
}
