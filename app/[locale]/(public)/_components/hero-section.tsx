import { Button } from '@/components/ui/button'
import slogan from '@/public/images/slogan.png'
import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <div className='relative mt-6 mb-10 flex items-center justify-center w-full max-w-7xl mx-auto px-4'>
      <Image
        src={slogan}
        alt='Khẩu hiệu'
        className='relative z-10 h-64 sm:h-80 md:h-96 lg:h-110 xl:h-120 2xl:h-130 w-auto max-w-full object-contain'
        priority
      />

      <div className='absolute left-4 -bottom-6 z-20 sm:left-4 sm:-bottom-6 md:left-8 md:-bottom-2 lg:left-32 lg:bottom-0 space-y-1'>
        <h1 className='text-lg font-bold text-foreground font-title sm:text-xl md:text-2xl lg:text-3xl'>
          Hoa Từ Trái Tim
        </h1>

        <div>
          <p className='text-[0.5rem] sm:text-[0.625rem] font-medium'>Hoa tươi được tạo nên để gửi gắm mọi cảm xúc.</p>
          <p className='text-[0.5rem] sm:text-[0.625rem] font-medium'>
            Từ tình yêu, niềm vui đến những dịp lễ và bất ngờ.
          </p>
          <p className='text-[0.5rem] sm:text-[0.625rem] font-medium'>Được sắp xếp tinh tế, giao tận tay chu đáo.</p>
        </div>

        <div className='flex items-center gap-1.5'>
          <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, index) => (
              <HugeiconsIcon
                key={index}
                icon={StarIcon}
                className='fill-orange-300 text-orange-400 size-2.5 sm:size-3 md:size-3.5'
              />
            ))}
          </div>
          <p className='font-medium text-[0.5rem] sm:text-[0.625rem]'>325 Đánh giá</p>
        </div>

        <Button size='sm' className='h-7 px-2.5 text-xs mt-2'>
          250.000đ/Hoa
        </Button>
      </div>
    </div>
  )
}
