import FlowersCarousel from './flowers-carousel'
import { SparkleDivider } from './sparkle-dividier'

export default function ShopFreshFlowersSection() {
  return (
    <div className='my-8 space-y-6 overflow-hidden px-4 sm:mt-10 sm:mb-16 sm:space-y-8 lg:space-y-10'>
      <div className='mx-auto w-full max-w-7xl space-y-2 sm:space-y-4 lg:space-y-6'>
        <div className='flex items-center justify-center gap-2 sm:gap-3 lg:gap-4'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='size-4 sm:size-5 lg:size-7'
            color='#516c6c'
          />

          <h1 className='shrink-0 text-center font-title text-2xl font-bold sm:text-3xl lg:text-4xl'>Mua Hoa Tươi</h1>

          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='size-4 sm:size-5 lg:size-7'
            direction='rtl'
            color='#516c6c'
          />
        </div>

        <p className='mx-auto max-w-[50rem] text-center text-sm leading-relaxed text-foreground/80 sm:text-base'>
          Khám phá bộ sưu tập hoa tươi được tuyển chọn kỹ lưỡng, sắp đặt tinh tế bởi những nghệ nhân chuyên nghiệp, mang
          đến vẻ đẹp, hương thơm và sự thanh lịch trường tồn ngay tận cửa nhà bạn.
        </p>
      </div>

      <FlowersCarousel />
    </div>
  )
}
