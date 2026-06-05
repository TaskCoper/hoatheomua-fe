'use client'

import logo from '@/public/images/logo.png'
import { Facebook01Icon, InstagramIcon, Mail01Icon, MessageMultiple01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

const POLICIES = [
  'Điều khoản sử dụng',
  'Chính sách đổi trả',
  'Đặt hàng & thanh toán',
  'Chính sách bảo mật thông tin',
  'Chính sách giao nhận & kiểm tra hàng'
]

const FEATURED_PRODUCTS = [
  'Hoa sinh nhật',
  'Hoa khai trương',
  'Hoa 8/3',
  'Hoa 20/10',
  'Hoa 20/11',
  'Hoa Noel',
  'Hoa mừng ngày 27/2',
  'Hoa chúc mừng doanh nhân',
  'Lan hồ điệp đẹp'
]

const SOCIALS = [
  { icon: Facebook01Icon, label: 'Facebook', href: '#' },
  { icon: Mail01Icon, label: 'Email', href: '#' },
  { icon: MessageMultiple01Icon, label: 'Zalo', href: '#' },
  { icon: InstagramIcon, label: 'Instagram', href: '#' }
]

export default function Footer() {
  return (
    <footer className='bg-background space-y-6 sm:space-y-8'>
      <div className='mx-auto w-full max-w-7xl px-4 pt-6 sm:pt-8 lg:pt-10 xl:px-0'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6'>
          <div className='space-y-2 lg:col-span-4'>
            <Image src={logo} alt='Logo' className='h-24 w-auto sm:h-28 lg:h-32' />
            <p className='text-lg font-bold sm:text-xl'>CÔNG TY TNHH HOA THEO MÙA</p>
            <div className='space-y-2 text-sm leading-relaxed text-foreground sm:text-base'>
              <p>
                <span className='font-semibold'>Hoa Theo Mùa</span> - Hệ thống hoa tươi online tại TP. Hồ Chí Minh
                chuyên cung cấp các dịch vụ hoa tươi & giao hoa tận nơi siêu nhanh trong 2 giờ.
              </p>
              <p>
                <span className='font-semibold'>Địa chỉ:</span> Số 13A Đào Duy Anh, Phường 9, Q, Phú Nhuận, Thành phố Hồ
                Chí Minh
              </p>
              <p>
                <span className='font-semibold'>Hotline:</span> 0983024353 – 0931734353
              </p>
              <p>
                <span className='font-semibold'>Giám đốc:</span> Lê Thị Hoa Đào
              </p>
              <p>
                <span className='font-semibold'>Website:</span> hoatheomua.net
              </p>
              <p>
                <span className='font-semibold'>GPKD:</span> 0316581199 Cấp ngày 12/11/2020
              </p>
            </div>
          </div>

          <div className='space-y-3 lg:col-span-3 lg:space-y-4'>
            <h2 className='text-lg font-bold text-primary sm:text-xl'>CHÍNH SÁCH</h2>
            <ul className='space-y-2 text-sm text-foreground sm:text-base'>
              {POLICIES.map((policy) => (
                <li key={policy} className='flex items-start gap-2'>
                  <span className='mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary' aria-hidden='true' />
                  <a href='#' className='transition-colors hover:text-primary'>
                    {policy}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='space-y-3 lg:col-span-2 lg:space-y-4'>
            <h2 className='text-lg font-bold text-primary sm:text-xl'>SẢN PHẨM NỔI BẬT</h2>
            <ul className='space-y-2 text-sm text-foreground sm:text-base'>
              {FEATURED_PRODUCTS.map((product) => (
                <li key={product} className='flex items-start gap-2'>
                  <span className='mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary' aria-hidden='true' />
                  <a href='#' className='transition-colors hover:text-primary'>
                    {product}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='space-y-3 lg:col-span-3 lg:space-y-4'>
            <h2 className='text-lg font-bold text-primary sm:text-xl'>BẢN ĐỒ</h2>
            <div className='overflow-hidden rounded-2xl border-2 border-secondary/80 shadow-md'>
              <iframe
                src='https://www.google.com/maps?q=13A+Dao+Duy+Anh,+Phu+Nhuan,+Ho+Chi+Minh&output=embed'
                title='Vị trí Hoa Theo Mùa'
                className='h-40 w-full sm:h-48 lg:h-44'
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
            </div>
            <div className='flex items-center gap-3'>
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className='grid size-9 place-items-center rounded-full border border-foreground text-foreground transition-colors hover:bg-primary hover:text-primary-foreground sm:size-10'
                >
                  <HugeiconsIcon icon={social.icon} className='size-4 sm:size-5' />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='bg-primary py-2 text-background sm:py-3'>
        <p className='mx-auto w-full max-w-7xl px-4 text-center text-xs leading-relaxed sm:text-sm lg:text-left xl:px-0'>
          Bản quyền © hình ảnh thuộc về HOA THEO MÙA ® - Các hành vi sử dụng hình ảnh khi chưa được sự đồng ý cho phép
          đều là hành vi xâm phạm quyền sở hữu trí tuệ.
        </p>
      </div>
    </footer>
  )
}
