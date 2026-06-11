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
    <div className='w-full bg-secondary flex items-center relative py-4 lg:py-10'>
      <Image
        src={leftBranch}
        alt='Cành lá trang trí'
        className='wind-wiggle-left h-3/4 w-auto absolute -left-4 top-1/2 -translate-y-1/2 opacity-70 hidden lg:block'
      />

      <div className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 z-10 sm:grid sm:grid-cols-6 sm:gap-x-4 sm:gap-y-4 sm:*:col-span-2 sm:[&>*:nth-child(4)]:col-start-2 lg:grid-cols-5 lg:gap-x-10 lg:*:col-span-1 lg:[&>*:nth-child(4)]:col-start-auto'>
        {CRITERIAS.map((criteria) => (
          <div
            key={criteria.id}
            className='flex w-full flex-row gap-2 items-center sm:flex-col sm:text-center lg:text-left lg:items-start'
          >
            <div className='p-1.5 rounded-full flex justify-center items-center bg-primary w-fit shadow-lg'>
              <HugeiconsIcon icon={criteria.icon} className='size-5 sm:size-6 md:size-7 text-white' />
            </div>

            <div className='-space-y-0.5'>
              <p className='font-semibold text-foreground text-xs sm:text-sm lg:text-base line-clamp-1'>
                {criteria.label}
              </p>
              <p className='text-[0.625rem] text-foreground/80 line-clamp-1'>{criteria.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Image
        src={rightBranch}
        alt='Cành lá trang trí'
        className='wind-wiggle-right h-3/4 w-auto absolute -right-4 top-1/2 -translate-y-1/2 opacity-70 hidden lg:block'
      />
    </div>
  )
}
