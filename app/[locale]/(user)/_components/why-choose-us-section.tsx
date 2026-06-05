import banner from '@/public/images/banner.png'
import Image from 'next/image'
import { SparkleDivider } from './sparkle-dividier'

const WHY_CHOOSE_FEATURES = [
  {
    number: '01',
    title: 'Sản Phẩm Tươi',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững.',
    className: 'lg:left-18 lg:top-18'
  },
  {
    number: '02',
    title: '100% Tự Nhiên',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững.',
    className: 'lg:-right-18 lg:top-18'
  },
  {
    number: '03',
    title: 'Chăm Sóc Tận Tâm',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững với khách hàng — và còn nhiều hơn thế.',
    className: 'lg:left-28 lg:bottom-18'
  },
  {
    number: '04',
    title: 'Hoàn Tiền Đảm Bảo',
    description:
      'Xây dựng một thương hiệu không thể diễn ra trong một sớm một chiều. Cần rất nhiều nỗ lực để vun đắp những mối quan hệ bền vững với khách hàng — và còn nhiều hơn thế.',
    className: 'lg:right-10 lg:bottom-18'
  }
]

export default function WhyChooseUsSection() {
  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col justify-center px-4'>
      <div className='my-8 space-y-2 sm:my-10 sm:space-y-4 lg:space-y-6'>
        <div className='flex items-center justify-center gap-2 sm:gap-3 lg:gap-4'>
          <SparkleDivider
            className='hidden min-w-0 max-w-96 flex-1 sm:flex'
            iconClassName='size-4 sm:size-5 lg:size-7'
            color='#516c6c'
          />

          <h1 className='shrink-0 text-center font-title text-2xl font-bold sm:text-3xl lg:text-4xl'>
            Tại Sao Chọn Chúng Tôi
          </h1>

          <SparkleDivider
            className='hidden min-w-0 max-w-96 flex-1 sm:flex'
            iconClassName='size-4 sm:size-5 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='mx-auto max-w-[50rem] text-center text-sm leading-relaxed text-foreground/80 sm:text-base'>
          Chúng tôi tin rằng hoa cần đến tay bạn tươi mới và rực rỡ như khoảnh khắc vừa được hái. Từ việc tuyển chọn
          từng bông hoa, đóng gói cẩn thận đến giao hàng đúng hẹn, mỗi bước đều được thực hiện bằng cả sự tận tâm.
        </p>
      </div>

      <section className='relative w-full lg:h-[40rem] lg:overflow-hidden'>
        <Image
          src={banner}
          alt='Bó hoa tươi'
          className='mx-auto h-64 w-auto max-w-none object-contain sm:h-80 md:h-96 lg:absolute lg:left-1/2 lg:top-0 lg:h-[40rem] lg:-translate-x-1/2'
          priority
        />

        <div className='mt-8 grid grid-cols-1 gap-8 mb-8 lg:mb-0 sm:grid-cols-2 sm:gap-10 lg:mt-0 lg:block lg:gap-0'>
          {WHY_CHOOSE_FEATURES.map((feature) => (
            <div key={feature.number} className={`relative lg:absolute lg:z-10 lg:w-92 ${feature.className}`}>
              <span className='pointer-events-none absolute -left-4 -top-6 -z-10 font-title text-6xl font-bold leading-none text-primary/10 sm:text-7xl lg:-left-16 lg:-top-8 lg:text-8xl'>
                {feature.number}
              </span>
              <h2 className='font-title text-xl font-bold leading-tight text-primary sm:text-2xl'>{feature.title}</h2>
              <p className='mt-2 text-sm leading-relaxed text-foreground'>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
