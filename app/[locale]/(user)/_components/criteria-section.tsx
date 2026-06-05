import leftBranch from '@/public/images/left-branch.png'
import rightBranch from '@/public/images/right-branch.png'
import { Award05Icon, DeliveryTruck01Icon, EcoEnergyIcon, Flower2Icon, PartyIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

const CRITERIAS = [
  {
    id: 1,
    icon: Flower2Icon,
    label: 'Hoa Tươi Mỗi Ngày',
    description: 'Tuyển chọn mỗi ngày, giao tươi nguyên'
  },
  {
    id: 100,
    icon: DeliveryTruck01Icon,
    label: 'Giao Hàng Trong Ngày',
    description: 'Giao ngay hôm nay, đảm bảo đúng hẹn'
  },
  {
    id: 200,
    icon: Award05Icon,
    label: 'Nghệ Nhân Tin Cậy',
    description: 'Cắm hoa bởi nghệ nhân chuyên nghiệp'
  },
  {
    id: 300,
    icon: PartyIcon,
    label: 'Mọi Dịp Lễ',
    description: 'Từ sinh nhật đến tiệc cưới'
  },
  {
    id: 400,
    icon: EcoEnergyIcon,
    label: 'Đóng Gói Thân Thiện',
    description: 'Trân trọng từng chi tiết với thiên nhiên'
  }
]

export default function CriteriaSection() {
  return (
    <div className='w-full bg-secondary flex items-center relative py-8 lg:py-0 lg:h-56'>
      <Image
        src={leftBranch}
        alt='Cành lá trang trí'
        className='wind-wiggle-left h-3/4 w-auto absolute -left-4 top-1/2 -translate-y-1/2 opacity-70 hidden xl:block'
      />

      <div className='mx-auto grid w-full max-w-7xl grid-cols-6 gap-x-4 gap-y-10 px-4 z-10 lg:flex lg:h-full lg:items-center lg:justify-between lg:gap-0 xl:px-0 *:col-span-2 [&>*:nth-child(4)]:col-start-2'>
        {CRITERIAS.map((criteria) => (
          <div
            key={criteria.id}
            className='flex flex-col items-center text-center space-y-1.5 sm:space-y-2 lg:items-start lg:text-left'
          >
            <div className='p-2 sm:p-2.5 rounded-full flex justify-center items-center bg-primary w-fit shadow-lg'>
              <HugeiconsIcon icon={criteria.icon} className='size-5 sm:size-6 lg:size-7.5 text-white' />
            </div>

            <div className='-space-y-0.5'>
              <p className='font-semibold text-foreground text-sm sm:text-base'>{criteria.label}</p>
              <p className='text-[0.625rem] sm:text-xs text-foreground/80'>{criteria.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Image
        src={rightBranch}
        alt='Cành lá trang trí'
        className='wind-wiggle-right h-3/4 w-auto absolute -right-4 top-1/2 -translate-y-1/2 opacity-70 hidden xl:block'
      />
    </div>
  )
}
