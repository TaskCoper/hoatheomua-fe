import { Button } from '@/components/ui/button'
import slogan from '@/public/images/slogan.png'
import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <div className='relative mt-6 mb-10 sm:mt-10 sm:mb-14 md:mt-12 md:mb-16 lg:mt-14 lg:mb-20 flex items-center justify-center w-full max-w-7xl mx-auto px-4'>
      <Image
        src={slogan}
        alt='Khẩu hiệu'
        className='relative z-10 h-64 sm:h-96 md:h-120 lg:h-140 w-auto max-w-full object-contain'
        priority
      />

      <div className='absolute left-4 -bottom-6 sm:left-8 sm:bottom-4 md:left-12 md:bottom-6 lg:left-15 lg:bottom-8 z-20 space-y-1 sm:space-y-1.5 md:space-y-2 lg:space-y-3'>
        <h1 className='text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground font-title'>
          Hoa Từ Trái Tim
        </h1>

        <div>
          <p className='text-[0.5rem] sm:text-[0.625rem] md:text-xs lg:text-sm font-medium'>
            Hoa tươi được tạo nên để gửi gắm mọi cảm xúc.
          </p>
          <p className='text-[0.5rem] sm:text-[0.625rem] md:text-xs lg:text-sm font-medium'>
            Từ tình yêu, niềm vui đến những dịp lễ và bất ngờ.
          </p>
          <p className='text-[0.5rem] sm:text-[0.625rem] md:text-xs lg:text-sm font-medium'>
            Được sắp xếp tinh tế, giao tận tay chu đáo.
          </p>
        </div>

        <div className='flex items-center gap-1.5 sm:gap-2 lg:gap-3'>
          <div className='flex items-center gap-0.5 sm:gap-1'>
            {Array.from({ length: 5 }).map((_, index) => (
              <HugeiconsIcon
                key={index}
                icon={StarIcon}
                className='fill-orange-300 text-orange-400 size-2.5 sm:size-3 md:size-3.5 lg:size-4'
              />
            ))}
          </div>
          <p className='font-medium text-[0.5rem] sm:text-[0.625rem] md:text-xs lg:text-sm'>325 Đánh giá</p>
        </div>

        <Button size='sm' className='h-7 px-2.5 text-[0.625rem] sm:h-8 sm:text-xs lg:h-9 lg:px-4 lg:text-sm'>
          250.000đ/Hoa
        </Button>
      </div>
    </div>
  )
}
