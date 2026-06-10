'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import logo from '@/public/images/logo.png'
import vine from '@/public/images/vine.png'
import { LoginCircle01Icon, Menu01Icon, Search01Icon, ShoppingBasket03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    id: 1,
    label: 'Trang chủ',
    href: '/'
  },
  {
    id: 50,
    label: 'Sản phẩm',
    href: '/products'
  },
  {
    id: 100,
    label: 'Giới thiệu',
    href: '/about'
  },
  {
    id: 200,
    label: 'Tin tức',
    href: '/news'
  },
  {
    id: 250,
    label: 'Tuyển dụng',
    href: '/careers'
  },
  {
    id: 300,
    label: 'Liên hệ',
    href: '/contact'
  }
]

export default function Header() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className='mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8'>
      <div className='flex items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]'>
        <Link
          href='/'
          aria-label='Hoa Theo Mùa'
          className='flex flex-col items-center gap-0.5 lg:justify-self-start cursor-pointer'
        >
          <Image src={logo} alt='Logo' className='h-10 sm:h-12 lg:h-14 w-auto' />
        </Link>

        <nav
          aria-label='Điều hướng chính'
          className='relative isolate justify-self-center rounded-full bg-primary p-1 shadow-md hidden lg:block'
        >
          <Image src={vine} alt='Cành nho' className='pointer-events-none absolute -left-20 -top-8 z-0 h-14 w-auto' />
          <Image
            src={vine}
            alt='Cành nho'
            className='pointer-events-none absolute -right-20 -top-8 z-0 h-14 w-auto -scale-x-100'
          />

          <ul className='relative z-10 flex items-center gap-4'>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)

              return (
                <li key={item.id}>
                  <Button
                    asChild
                    variant='ghost'
                    size='sm'
                    className={
                      active
                        ? 'bg-background text-primary hover:bg-background/90 hover:text-primary'
                        : 'text-background hover:bg-background/15 hover:text-background'
                    }
                  >
                    <Link href={item.href} aria-current={active ? 'page' : undefined}>
                      {item.label}
                    </Link>
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className='hidden items-center gap-2 lg:flex lg:justify-self-end'>
          <Button asChild>
            <Link href='/sign-in'>
              {t('auth.signIn.title')}
              <HugeiconsIcon icon={LoginCircle01Icon} />
            </Link>
          </Button>

          <Button
            variant='outline'
            size='icon-sm'
            className='border-none ring ring-primary ring-inset'
            aria-label='Mở giỏ hàng'
          >
            <HugeiconsIcon icon={ShoppingBasket03Icon} />
          </Button>

          <Button
            variant='outline'
            size='icon-sm'
            className='border-none ring ring-primary ring-inset'
            aria-label='Tìm kiếm'
          >
            <HugeiconsIcon icon={Search01Icon} />
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild className='lg:hidden'>
            <Button size='icon-sm' className='border-none ring ring-primary ring-inset' aria-label='Mở menu'>
              <HugeiconsIcon icon={Menu01Icon} />
            </Button>
          </SheetTrigger>

          <SheetContent side='right' className='w-72 sm:w-80 sm:max-w-none gap-0'>
            <SheetHeader className='border-b border-secondary'>
              <SheetTitle asChild>
                <Link href='/' aria-label='Hoa Theo Mùa' className='flex items-center'>
                  <Image src={logo} alt='Logo' className='h-10 w-auto' />
                </Link>
              </SheetTitle>
            </SheetHeader>

            <nav aria-label='Điều hướng di động' className='flex flex-col gap-1 p-4'>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href)

                return (
                  <SheetClose asChild key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        active ? 'bg-primary text-background' : 'text-foreground hover:bg-secondary hover:text-primary'
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>

            <div className='mt-auto flex flex-col gap-3 border-t border-secondary p-4'>
              <SheetClose asChild>
                <Button asChild className='w-full'>
                  <Link href='/sign-in'>
                    {t('auth.signIn.title')}
                    <HugeiconsIcon icon={LoginCircle01Icon} />
                  </Link>
                </Button>
              </SheetClose>

              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='flex-1 border-none ring ring-primary ring-inset'
                  aria-label='Mở giỏ hàng'
                >
                  <HugeiconsIcon icon={ShoppingBasket03Icon} />
                </Button>

                <Button
                  variant='outline'
                  size='icon-sm'
                  className='flex-1 border-none ring ring-primary ring-inset'
                  aria-label='Tìm kiếm'
                >
                  <HugeiconsIcon icon={Search01Icon} />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
