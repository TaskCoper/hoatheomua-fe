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
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { routing } from '@/lib/i18n/routing'
import logo from '@/public/images/logo.png'
import { CompanyConfigItem } from '@/types/config.type'
import {
  GlobalIcon,
  LoginCircle01Icon,
  MailValidation01Icon,
  Menu01Icon,
  PackageIcon,
  ShoppingBasket03Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import NavUser from './nav-user'

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

export default function Header() {
  const { isAuthenticated, me, isGettingMe, isVerificationRequired } = useGetMe()

  const { configs: companyConfigs } = useGetPublicConfigs<CompanyConfigItem, 'company.bg_video'>({
    group: 'company',
    key: 'company.bg_video'
  })
  const video = companyConfigs[0]?.value.value

  const { t } = useTranslation()
  const pathname = usePathname()

  const normalizePathname = (path: string) => {
    const localePrefix = /^\/(vi|en)(?=\/|$)/
    return path.replace(localePrefix, '') || '/'
  }

  const isActive = (href: string) => {
    const pathToCheck = normalizePathname(pathname)

    if (href === '/') {
      return pathToCheck === '/'
    }

    return pathToCheck === href || pathToCheck.startsWith(`${href}/`)
  }

  return (
    <header className='relative isolate min-h-[18rem] w-full overflow-hidden bg-background sm:min-h-[26rem] lg:min-h-[36rem]'>
      <iframe
        title='Hoa Theo Mua home video'
        src={video}
        allow='autoplay; encrypted-media; picture-in-picture'
        referrerPolicy='strict-origin-when-cross-origin'
        className='pointer-events-none absolute left-1/2 top-1/2 z-0 h-[56.25vw] min-h-full w-[177.7778vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0'
      />
      <div className='pointer-events-none absolute inset-0 z-0 bg-foreground/10' aria-hidden='true' />

      <div className='relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 p-4 sm:p-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:p-8'>
        <Link
          href='/'
          aria-label={t('header.brand')}
          className='flex flex-col items-center gap-0.5 lg:justify-self-start cursor-pointer'
        >
          <Image src={logo} alt={t('header.logoAlt')} className='h-10 sm:h-12 lg:h-14 w-auto' />
        </Link>

        <nav
          aria-label={t('header.aria.mainNav')}
          className='relative isolate justify-self-center rounded-full bg-primary p-1 shadow-md hidden lg:block'
        >
          {/* <Image
            src={vine}
            alt={t('header.vineAlt')}
            className='pointer-events-none absolute hidden xl:block -left-20 -top-8 z-0 h-14 w-auto'
          />
          <Image
            src={vine}
            alt={t('header.vineAlt')}
            className='pointer-events-none absolute hidden xl:block -right-20 -top-8 z-0 h-14 w-auto -scale-x-100'
          /> */}

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

              {isVerificationRequired ? (
                <Button asChild>
                  <Link href={{ pathname: '/verify-sent', query: { email: me!.email } }}>
                    {t('auth.verifyEmail.title')}
                    <HugeiconsIcon icon={MailValidation01Icon} />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant='outline'
                    size='icon-sm'
                    className='border-none ring ring-primary ring-inset'
                    aria-label={t('header.aria.openCart')}
                    asChild
                  >
                    <Link href='/cart'>
                      <HugeiconsIcon icon={ShoppingBasket03Icon} />
                    </Link>
                  </Button>

                  <Button
                    variant='outline'
                    size='icon-sm'
                    className='flex-1 border-none ring ring-primary ring-inset'
                    aria-label={t('header.aria.openOrders')}
                    asChild
                  >
                    <Link href='/orders'>
                      <HugeiconsIcon icon={PackageIcon} />
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
                  <Image src={logo} alt={t('header.logoAlt')} className='h-8 w-auto' />
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

                  {isVerificationRequired ? (
                    <SheetClose asChild>
                      <Button asChild className='w-full'>
                        <Link href={{ pathname: '/verify-sent', query: { email: me!.email } }}>
                          {t('auth.verifyEmail.title')}
                          <HugeiconsIcon icon={MailValidation01Icon} />
                        </Link>
                      </Button>
                    </SheetClose>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='icon-sm'
                        className='flex-1 border-none ring ring-primary ring-inset'
                        aria-label={t('header.aria.openCart')}
                        asChild
                      >
                        <Link href='/cart'>
                          <HugeiconsIcon icon={ShoppingBasket03Icon} />
                        </Link>
                      </Button>

                      <Button
                        variant='outline'
                        size='icon-sm'
                        className='flex-1 border-none ring ring-primary ring-inset'
                        aria-label={t('header.aria.openOrders')}
                        asChild
                      >
                        <Link href='/orders'>
                          <HugeiconsIcon icon={PackageIcon} />
                        </Link>
                      </Button>
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
    </header>
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
