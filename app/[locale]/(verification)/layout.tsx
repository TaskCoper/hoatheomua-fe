import AuthGuard from '@/guards/auth-guard'
import downLeftCorner from '@/public/images/DownLeftCorner-removebg-preview.png'
import downRightCorner from '@/public/images/DownRightCorner-removebg-preview.png'
import upperLeftCorner from '@/public/images/UpperLeftCorner-removebg-preview.png'
import upperRightCorner from '@/public/images/UpperRightCorner-removebg-preview.png'
import { cn } from '@/shared/utils'
import Image, { type StaticImageData } from 'next/image'
import FloatingPetals from '../(public)/_components/floating-petals'

type CornerImageProps = {
  src: StaticImageData
  alt: string
  className: string
}

function DecorativeCornerImage({ src, alt, className }: CornerImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      aria-hidden
      priority={false}
      className={cn('pointer-events-none absolute z-0 select-none object-contain', className)}
    />
  )
}

export default function VerificationLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiresAuth={false}>
      <main className='relative isolate flex h-svh overflow-hidden bg-[#EBF0EC] px-4 py-4 text-[#3F5352] sm:px-6 sm:py-5 lg:px-8'>
        <div className='z-0'>
          <FloatingPetals />
        </div>
        <DecorativeCornerImage
          src={upperLeftCorner}
          alt=''
          className='wind-wiggle-left left-0 z-30 top-0 w-36 -translate-x-6 -translate-y-4 sm:w-56 lg:w-72 xl:w-80'
        />
        <DecorativeCornerImage
          src={upperRightCorner}
          alt=''
          className=' wind-wiggle-right right-0 z-30 top-0 w-40 translate-x-5 -translate-y-6 sm:w-60 lg:w-80 xl:w-96'
        />
        <DecorativeCornerImage
          src={downLeftCorner}
          alt=''
          className='wind-wiggle-left bottom-0 z-30 left-0 w-40 -translate-x-7 translate-y-5 sm:w-60 lg:w-72 xl:w-80'
        />
        <DecorativeCornerImage
          src={downRightCorner}
          alt=''
          className=' wind-wiggle-right bottom-0 z-30 right-0 w-40 translate-x-6 translate-y-6 sm:w-60 lg:w-72 xl:w-80'
        />

        <div className='mx-auto mt-2 flex w-[92%] max-w-[45rem] flex-col items-center justify-center text-center sm:mt-3'>
          {children}
        </div>
      </main>
    </AuthGuard>
  )
}
