import banner from '@/public/images/banner.png'
import Image from 'next/image'
import { SparkleDivider } from './sparkle-dividier'

const WHY_CHOOSE_FEATURES = [
  {
    number: '01',
    title: 'Sản Phẩm Tươi',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững.',
    className: 'lg:left-16 lg:top-18 xl:left-24 xl:top-22'
  },
  {
    number: '02',
    title: '100% Tự Nhiên',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững.',
    className: 'lg:-right-2 lg:top-18 xl:right-20 xl:top-22 2xl:right-18 2xl:top-22'
  },
  {
    number: '03',
    title: 'Chăm Sóc Tận Tâm',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững với khách hàng — và còn nhiều hơn thế.',
    className: 'lg:left-28 lg:bottom-18 xl:left-50 xl:bottom-22 2xl:left-52 2xl:bottom-22'
  },
  {
    number: '04',
    title: 'Hoàn Tiền Đảm Bảo',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững với khách hàng — và còn nhiều hơn thế.',
    className: 'lg:right-10 lg:bottom-18 xl:right-20 xl:bottom-22 2xl:right-28 2xl:bottom-22'
  }
]

export default function WhyChooseUsSection() {
  return (
    <div className='space-y-2 overflow-hidden px-4'>
      <div className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 mt-4 sm:mt-6 md:mt-8 lg:mt-10'>
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            color='#516c6c'
          />

          <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            Tại Sao Chọn Chúng Tôi
          </h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground/80'>
          Chúng tôi tin rằng hoa cần đến tay bạn tươi mới và rực rỡ như khoảnh khắc vừa được hái. Từ việc tuyển chọn
          từng bông hoa, đóng gói cẩn thận đến giao hàng đúng hẹn, mỗi bước đều được thực hiện bằng cả sự tận tâm.
        </p>
      </div>

      <section className='relative mx-auto w-full max-w-7xl lg:h-160 lg:overflow-hidden xl:h-176 2xl:h-192'>
        <Image
          src={banner}
          alt='Bó hoa tươi'
          className='mx-auto h-64 w-auto max-w-none object-contain lg:absolute lg:left-1/2 lg:top-0 lg:h-160 lg:-translate-x-1/2 xl:h-176 2xl:h-192'
          priority
        />

        <div className='mt-8 grid grid-cols-1 gap-4 mb-8 lg:mb-0 lg:mt-0 lg:block lg:gap-0'>
          {WHY_CHOOSE_FEATURES.map((feature) => (
            <div
              key={feature.number}
              className={`relative lg:absolute lg:z-10 lg:w-64 xl:w-72 2xl:w-80 ${feature.className}`}
            >
              <span className='pointer-events-none absolute -left-4 -top-6 -z-10 font-title text-6xl font-bold leading-none text-primary/10 lg:-left-16 lg:-top-8 lg:text-8xl xl:-left-20 xl:-top-10 xl:text-9xl 2xl:-left-24 2xl:-top-12 2xl:text-[9rem]'>
                {feature.number}
              </span>
              <h2 className='font-title text-lg font-bold leading-tight text-primary lg:text-2xl 2xl:text-3xl'>
                {feature.title}
              </h2>
              <p className='mt-1 text-xs leading-relaxed text-foreground xl:text-sm'>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
