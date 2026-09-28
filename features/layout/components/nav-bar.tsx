'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import NavUser from '@/features/layout/components/nav-user'
import { useAccountHref } from '@/features/users/hooks/use-account-href'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { routing } from '@/lib/i18n/routing'
import logo from '@/public/images/logo.png'
import {
  GlobalIcon,
  LoginCircle01Icon,
  Menu01Icon,
  Settings01Icon,
  ShoppingBasket03Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

const NAV_ITEMS = [
  { id: 1, labelKey: 'header.nav.home', href: '/' },
  { id: 50, labelKey: 'header.nav.products', href: '/products' },
  { id: 75, labelKey: 'header.nav.b2b', href: '/b2b' },
  { id: 100, labelKey: 'header.nav.about', href: '/about' },
  { id: 200, labelKey: 'header.nav.news', href: '/news' },
  { id: 250, labelKey: 'header.nav.recruitment', href: '/recruitment' },
  { id: 300, labelKey: 'header.nav.contact', href: '/contact' }
] as const

const LOCALE_OPTIONS = [
  { value: 'vi', labelKey: 'language.vietnamese' },
  { value: 'en', labelKey: 'language.english' }
] as const

const CART_BUTTON_CLASS = 'border-none ring ring-primary ring-inset'
const CART_BUTTON_CLASS_MOBILE = `flex-1 ${CART_BUTTON_CLASS}`

export default function NavBar() {
  const { isAuthenticated, me, isGettingMe, canUseStorefront } = useGetMe()
  const accountHref = useAccountHref()

  const { t } = useTranslation()
  const pathname = usePathname()

  const normalizePathname = (path: string) => {
    const localePrefix = /^\/(vi|en)(?=\/|$)/
    return path.replace(localePrefix, '') || '/'
  }

  const isActive = (href: string) => {
    const pathToCheck = normalizePathname(pathname)
    if (href === '/') return pathToCheck === '/'
    return pathToCheck === href || pathToCheck.startsWith(`${href}/`)
  }

  return (
    <div className='flex items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]'>
      <Link
        href='/'
        aria-label={t('header.brand')}
        className='flex flex-col items-center gap-0.5 lg:justify-self-start cursor-pointer'
      >
        <Image
          src={logo}
          alt={t('header.logoAlt')}
          sizes='(min-width: 1024px) 56px, (min-width: 640px) 48px, 40px'
          quality={80}
          loading='eager'
          className='h-10 sm:h-12 lg:h-14 w-auto'
        />
      </Link>

      <nav
        aria-label={t('header.aria.mainNav')}
        className='relative isolate justify-self-center rounded-full bg-primary p-1 shadow-md hidden lg:block'
      >
        <ul className='relative z-10 flex items-center gap-2'>
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
                    {t(item.labelKey)}
                  </Link>
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className='hidden items-center gap-2 lg:flex lg:justify-self-end z-10'>
        {isGettingMe ? (
          <Skeleton className='h-9 w-32 rounded-full' />
        ) : isAuthenticated ? (
          <>
            <NavUser user={me} />

            {canUseStorefront && (
              <>
                <Button asChild variant='outline' size='icon-sm' className={CART_BUTTON_CLASS}>
                  <Link href='/cart' aria-label={t('header.aria.openCart')}>
                    <HugeiconsIcon icon={ShoppingBasket03Icon} />
                  </Link>
                </Button>

                <Button asChild variant='outline' size='icon-sm' className={CART_BUTTON_CLASS}>
                  <Link href={accountHref} aria-label={t('header.aria.openAccount')}>
                    <HugeiconsIcon icon={Settings01Icon} />
                  </Link>
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button asChild>
              <Link href='/sign-in'>
                {t('auth.signIn.title')}
                <HugeiconsIcon icon={LoginCircle01Icon} />
              </Link>
            </Button>

            <LanguageSwitcher />
          </>
        )}
      </div>

      <Sheet>
        <SheetTrigger asChild className='lg:hidden'>
          <Button
            size='icon-sm'
            className='border-none ring ring-primary ring-inset'
            aria-label={t('header.aria.openMenu')}
          >
            <HugeiconsIcon icon={Menu01Icon} />
          </Button>
        </SheetTrigger>

        <SheetContent side='right' className='w-72 sm:w-80 sm:max-w-none gap-0'>
          <SheetHeader className='border-b border-secondary'>
            <SheetTitle asChild>
              <Link href='/' aria-label={t('header.brand')} className='flex items-center'>
                <Image src={logo} alt={t('header.logoAlt')} sizes='32px' quality={80} className='h-8 w-auto' />
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav aria-label={t('header.aria.mobileNav')} className='flex flex-col gap-1 p-4'>
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
                    {t(item.labelKey)}
                  </Link>
                </SheetClose>
              )
            })}
          </nav>

          <div className='mt-auto flex flex-col gap-3 border-t border-secondary p-4'>
            {isGettingMe ? (
              <Skeleton className='h-9 w-full rounded-full' />
            ) : isAuthenticated ? (
              <>
                <div className='flex items-center justify-end'>
                  <NavUser user={me} />
                </div>

                {canUseStorefront && (
                  <div className='flex items-center gap-2'>
                    <SheetClose asChild>
                      <Button asChild variant='outline' size='sm' className={CART_BUTTON_CLASS_MOBILE}>
                        <Link href='/cart'>
                          <HugeiconsIcon icon={ShoppingBasket03Icon} />
                          {t('header.nav.cart')}
                        </Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button asChild variant='outline' size='sm' className={CART_BUTTON_CLASS_MOBILE}>
                        <Link href={accountHref}>
                          <HugeiconsIcon icon={Settings01Icon} />
                          {t('header.nav.account')}
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Button asChild className='w-full'>
                    <Link href='/sign-in'>
                      {t('auth.signIn.title')}
                      <HugeiconsIcon icon={LoginCircle01Icon} />
                    </Link>
                  </Button>
                </SheetClose>

                <LanguageSwitcher className='w-full' />
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function LanguageSwitcher({ className }: { className?: string }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useTranslation()

  const handleLanguageChange = (value: string) => {
    const nextLocale = value as (typeof routing.locales)[number]
    router.replace(pathname, { locale: nextLocale })
    queryClient.invalidateQueries()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={['h-8 min-w-14 border-none px-2 ring ring-primary ring-inset', className]
            .filter(Boolean)
            .join(' ')}
          aria-label={t('account.language')}
        >
          <HugeiconsIcon icon={GlobalIcon} />
          <span className='text-[0.625rem] font-bold uppercase leading-none'>{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8}>
        <DropdownMenuRadioGroup value={locale} onValueChange={handleLanguageChange}>
          {LOCALE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} className='cursor-pointer' value={option.value}>
              {t(option.labelKey)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
