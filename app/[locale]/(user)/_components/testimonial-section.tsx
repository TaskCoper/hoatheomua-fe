import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function TestimonialSection() {
  return (
    <div className='bg-secondary pt-4 pb-8 sm:pb-10 lg:pb-12'>
      <div className='mx-auto w-full max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-5 lg:space-y-8'>
        <h1 className='text-center font-title text-2xl font-bold sm:text-3xl lg:text-4xl'>Khách Hàng Nói Gì</h1>

        <p className='mx-auto max-w-4xl text-center text-sm leading-relaxed text-foreground sm:text-base'>
          Tôi hiếm khi viết đánh giá, nhưng trải nghiệm này thực sự xứng đáng. Tôi đặt một bó hoa cho sinh nhật mẹ và
          mong muốn mọi thứ đều thật hoàn hảo. Ngay từ lúc đặt hàng, tôi đã được cập nhật tình trạng giao nhận liên tục,
          điều đó khiến tôi rất yên tâm. Khi hoa được giao đến, chúng còn đẹp hơn cả những gì tôi tưởng tượng – tươi
          mới, rực rỡ và được cắm vô cùng tinh tế. Mẹ tôi thực sự xúc động khi nhận được. Cảm ơn shop đã biến một món
          quà giản dị thành khoảnh khắc đáng nhớ cho gia đình tôi.
        </p>

        <div className='mx-auto flex w-full max-w-4xl justify-between gap-4 flex-row items-center sm:gap-2'>
          <div className='border-l-2 border-primary pl-4'>
            <p className='font-medium text-primary'>Nguyễn Thị Mai</p>
            <p className='text-sm text-muted-foreground'>Quản Lý Sự Kiện</p>
          </div>

          <div className='flex items-center gap-1.5 sm:gap-2'>
            {Array.from({ length: 5 }).map((_, index) => (
              <HugeiconsIcon key={index} icon={StarIcon} className='size-4 fill-orange-300 text-orange-400 sm:size-5' />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
