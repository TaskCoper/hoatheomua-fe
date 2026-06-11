'use client'

import image10 from '@/public/images/10.png'
import image11 from '@/public/images/11.png'
import image2 from '@/public/images/2.png'
import image3 from '@/public/images/3.png'
import image5 from '@/public/images/5.png'
import image6 from '@/public/images/6.png'
import image7 from '@/public/images/7.png'
import image8 from '@/public/images/8.png'
import image9 from '@/public/images/9.png'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const ITEMS = [
  { id: 1, label: 'Hoa Vườn', price: '550.000đ/Bó', image: image11 },
  { id: 2, label: 'Hồng Pastel Mộng Mơ', price: '650.000đ/Bó', image: image2 },
  { id: 3, label: 'Vườn Hoa Hồng Phấn', price: '550.000đ/Bó', image: image3 },
  { id: 4, label: 'Hồng Ngọt Ngào', price: '600.000đ/Bó', image: image10 },
  { id: 5, label: 'Cẩm Tú Cầu Bung Nở', price: '750.000đ/Bó', image: image5 },
  { id: 6, label: 'Hồng Thanh Lịch', price: '625.000đ/Bó', image: image6 },
  { id: 7, label: 'Hồng Cổ Điển', price: '800.000đ/Bó', image: image7 },
  { id: 8, label: 'Hoa Dại', price: '675.000đ/Bó', image: image8 },
  { id: 9, label: 'Hồng Pastel', price: '700.000đ/Bó', image: image9 }
]
const AUTO_INTERVAL = 10_000
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const FLOWER_RING_COLORS = {
  secondary: '#bcd0c7',
  primary: '#516c6c'
}
const FLOWERS_CAROUSEL_CLASS_NAME =
  'relative left-1/2 h-[calc(var(--flower-image-active)+5.5rem)] w-screen max-w-none -translate-x-1/2 [--flower-image-active:clamp(10.5rem,56vw,13rem)] [--flower-image-corner:clamp(7.25rem,42vw,9.5rem)] [--flower-image-rest:clamp(5.75rem,32vw,7.25rem)] [--flower-ring-active:clamp(6.5rem,34vw,8rem)] [--flower-ring-corner:clamp(5rem,28vw,6.25rem)] [--flower-ring-rest:clamp(4rem,22vw,4.75rem)] [--flower-slide:clamp(7.5rem,42vw,9rem)] sm:[--flower-image-active:16rem] sm:[--flower-image-corner:11.5rem] sm:[--flower-image-rest:9.5rem] sm:[--flower-ring-active:10rem] sm:[--flower-ring-corner:7.5rem] sm:[--flower-ring-rest:5.75rem] sm:[--flower-slide:11.5rem] md:[--flower-image-active:22rem] md:[--flower-image-corner:16rem] md:[--flower-image-rest:12rem] md:[--flower-ring-active:13.75rem] md:[--flower-ring-corner:9rem] md:[--flower-ring-rest:6.75rem] md:[--flower-slide:14rem] lg:h-140 lg:[--flower-image-active:28.8rem] lg:[--flower-image-corner:19.8rem] lg:[--flower-image-rest:14.4rem] lg:[--flower-ring-active:17.2rem] lg:[--flower-ring-corner:9.5rem] lg:[--flower-ring-rest:5.9rem] lg:[--flower-slide:19.5rem] xl:[--flower-slide:23.5rem]'

export default function FlowersCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', containScroll: false, duration: 30 }, [
    Autoplay({ delay: AUTO_INTERVAL, stopOnInteraction: false, stopOnMouseEnter: false })
  ])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

  return (
    <div className={FLOWERS_CAROUSEL_CLASS_NAME}>
      <div className='h-full overflow-hidden' ref={emblaRef}>
        <div className='flex h-full items-center'>
          {ITEMS.map((item, index) => {
            const rawDistance = Math.abs(index - activeIndex)
            const distanceFromActive = Math.min(rawDistance, ITEMS.length - rawDistance)
            const isActive = distanceFromActive === 0
            const isCornerItem = distanceFromActive === 1
            const imageSize = isActive
              ? 'var(--flower-image-active)'
              : isCornerItem
                ? 'var(--flower-image-corner)'
                : 'var(--flower-image-rest)'
            const ringSize = isActive
              ? 'var(--flower-ring-active)'
              : isCornerItem
                ? 'var(--flower-ring-corner)'
                : 'var(--flower-ring-rest)'
            const ringColor = isActive ? FLOWER_RING_COLORS.primary : FLOWER_RING_COLORS.secondary

            return (
              <button
                key={item.id}
                type='button'
                className={[
                  'w-[var(--flower-slide)] shrink-0 cursor-pointer px-3 text-center focus:outline-none',
                  isActive ? 'relative z-20' : isCornerItem ? 'relative z-10' : ''
                ].join(' ')}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={item.label}
              >
                <div
                  className='flex flex-col items-center text-center'
                  style={{
                    opacity: distanceFromActive <= 2 ? 1 : 0.72,
                    transition: `opacity 550ms ${EASE}`
                  }}
                >
                  <div
                    className='grid place-items-center'
                    style={{
                      width: imageSize,
                      height: imageSize,
                      transition: `width 550ms ${EASE}, height 550ms ${EASE}`
                    }}
                  >
                    <span
                      aria-hidden
                      className='col-start-1 row-start-1 rounded-full'
                      style={{
                        width: ringSize,
                        height: ringSize,
                        backgroundColor: ringColor,
                        transition: `width 550ms ${EASE}, height 550ms ${EASE}, background-color 550ms ${EASE}`
                      }}
                    />
                    <Image
                      src={item.image}
                      alt=''
                      className='pointer-events-none col-start-1 row-start-1 object-contain'
                      style={{
                        width: imageSize,
                        height: imageSize,
                        transition: `width 550ms ${EASE}, height 550ms ${EASE}`
                      }}
                      priority={index < 3}
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                  </div>

                  <span className='block w-full truncate text-xs font-semibold text-foreground sm:text-sm'>
                    {item.label}
                  </span>

                  <span
                    className='mt-1.5 rounded-full bg-primary px-3 py-1 text-[0.625rem] font-semibold text-primary-foreground sm:mt-2 sm:px-4 sm:py-1.5 sm:text-xs'
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: `translateY(${isActive ? 0 : -4}px)`,
                      transition: `opacity 350ms ${EASE}, transform 350ms ${EASE}`
                    }}
                  >
                    {item.price}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
