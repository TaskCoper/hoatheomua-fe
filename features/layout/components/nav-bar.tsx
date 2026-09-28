'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import CartNavButton from '@/features/layout/components/cart-nav-button'
import MobileNavSheet from '@/features/layout/components/mobile-nav-sheet'
import NavUser from '@/features/layout/components/nav-user'
import { useAccountHref } from '@/features/users/hooks/use-account-href'
import { useGetMe } from '@/features/users/hooks/use-get-me'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { routing } from '@/lib/i18n/routing'
import logo from '@/public/images/logo.png'
import { GlobalIcon, LoginCircle01Icon, Settings01Icon } from '@hugeicons/core-free-icons'
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
        className='flex cursor-pointer flex-col items-center gap-0.5 lg:justify-self-start'
      >
        <Image
          src={logo}
          alt={t('header.logoAlt')}
          sizes='(min-width: 1024px) 56px, (min-width: 640px) 48px, 40px'
          quality={80}
          loading='eager'
          className='h-10 w-auto sm:h-12 lg:h-14'
        />
      </Link>

      <nav
        aria-label={t('header.aria.mainNav')}
        className='relative isolate hidden justify-self-center rounded-full bg-primary p-1 shadow-md lg:block'
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

      <div className='z-10 hidden items-center gap-2 lg:flex lg:justify-self-end'>
        {isGettingMe ? (
          <Skeleton className='h-9 w-32 rounded-full' />
        ) : isAuthenticated ? (
          <>
            <NavUser user={me} />

            {canUseStorefront && (
              <>
                <CartNavButton />

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

      <div className='flex items-center gap-2 lg:hidden'>
        {isGettingMe ? (
          <Skeleton className='size-11 rounded-full' />
        ) : canUseStorefront ? (
          <CartNavButton size='lg' className='size-11' />
        ) : null}

        <MobileNavSheet
          me={me}
          isGettingMe={isGettingMe}
          isAuthenticated={isAuthenticated}
          canUseStorefront={canUseStorefront}
          isActive={isActive}
          languageSwitcher={<LanguageSwitcher />}
        />
      </div>
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
          <span className='text-[0.625rem] leading-none font-bold uppercase'>{locale}</span>
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
