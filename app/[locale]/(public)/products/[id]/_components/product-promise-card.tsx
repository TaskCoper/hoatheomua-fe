import { CheckmarkCircle02Icon, Flower2Icon, HandHeartIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const PROMISES = [
  { icon: Flower2Icon, label: 'Hoa nhập trong ngày, tươi 100%' },
  { icon: HandHeartIcon, label: 'Cắm thủ công bởi nghệ nhân' },
  { icon: CheckmarkCircle02Icon, label: 'Đổi bó miễn phí trong 24 giờ' },
  { icon: Wallet01Icon, label: 'Thanh toán linh hoạt khi nhận hoa' }
]

export default function ProductPromiseCard() {
  return (
    <div className='space-y-3 rounded-3xl bg-card px-4 py-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5'>
      <p className='font-title text-base font-bold text-primary'>Cam kết Hoa Theo Mùa</p>

      <ul className='space-y-2.5'>
        {PROMISES.map((promise) => (
          <li key={promise.label} className='flex items-center gap-2.5 text-sm text-foreground'>
            <span className='grid size-7 shrink-0 place-items-center rounded-full bg-secondary/40 text-primary ring-1 ring-primary/10'>
              <HugeiconsIcon icon={promise.icon} className='size-3.5' />
            </span>
            <span className='leading-snug'>{promise.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
