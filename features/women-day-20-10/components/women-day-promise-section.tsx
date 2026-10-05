'use client'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import ctaCornerFlower from '@/public/images/DownLeftCorner-removebg-preview.png'
import ctaFloralCluster from '@/public/images/bg-news-1.png'
import petalOne from '@/public/images/petal-1.png'
import petalTwo from '@/public/images/petal-2.png'
import petalThree from '@/public/images/petal-3.png'
import { GiftIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

export default function WomenDayPromiseSection() {
  const { t } = useTranslation()

  return (
    <section className='px-4 py-14 sm:px-6 sm:py-18 lg:py-22'>
      <div className='relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] bg-primary px-6 py-10 text-primary-foreground shadow-[0_1rem_3rem_rgb(81_108_108/22%)] sm:px-10 lg:grid-cols-[1fr_auto] lg:px-16'>
        <Image
          src={ctaFloralCluster}
          alt=''
          width={500}
          height={500}
          className='pointer-events-none absolute -right-20 -bottom-36 z-0 w-72 max-w-none opacity-35 sm:-right-10 sm:-bottom-44 sm:w-96'
        />
        <Image
          src={ctaCornerFlower}
          alt=''
          width={500}
          height={500}
          className='pointer-events-none absolute -bottom-28 -left-20 z-0 w-64 max-w-none opacity-25 sm:-bottom-36 sm:-left-8 sm:w-80'
        />
        <Image
          src={petalOne}
          alt=''
          width={100}
          height={100}
          className='wind-wiggle-left pointer-events-none absolute -top-8 right-16 z-0 size-20 object-contain opacity-25 sm:size-28'
        />
        <Image
          src={petalTwo}
          alt=''
          width={100}
          height={100}
          className='wind-wiggle-right pointer-events-none absolute -bottom-8 left-8 z-0 size-20 object-contain opacity-20 sm:size-28'
        />
        <Image
          src={petalThree}
          alt=''
          width={80}
          height={80}
          className='wind-wiggle-left pointer-events-none absolute right-1/3 bottom-2 z-0 size-12 object-contain opacity-20 sm:size-16'
        />
        <div className='relative z-10 max-w-2xl'>
          <p className='text-xs font-bold tracking-[0.2em] text-primary-foreground/70 uppercase'>
            {t('womenDay.promise.eyebrow')}
          </p>
          <h2 className='mt-2 font-title text-3xl leading-tight font-bold text-primary-foreground sm:text-4xl'>
            {t('womenDay.promise.title')}
          </h2>
          <p className='mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base'>
            {t('womenDay.promise.text')}
          </p>
        </div>
        <Button asChild size='lg' variant='secondary' className='relative z-10 w-fit gap-2 shadow-lg'>
          <Link href='/products'>
            <HugeiconsIcon icon={GiftIcon} className='size-4' />
            {t('womenDay.promise.order')}
          </Link>
        </Button>
      </div>
    </section>
  )
}
