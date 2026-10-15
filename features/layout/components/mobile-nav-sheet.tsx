'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccountHref } from '@/features/users/hooks/use-account-href'
import { useAuthHref } from '@/features/users/hooks/use-auth-href'
import { useSignOut } from '@/features/users/hooks/use-sign-out'
import type { Me } from '@/features/users/types'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link, useRouter } from '@/lib/i18n/navigation'
import type { I18nKey } from '@/lib/i18n/types'
import { cn, formatFullName, getNameInitials, isModifiedClick } from '@/shared/utils'
import {
  AiMagicIcon,
  ArrowRight01Icon,
  Briefcase01Icon,
  Building03Icon,
  Cancel01Icon,
  FlowerIcon,
  Home01Icon,
  InformationCircleIcon,
  Location01Icon,
  LoginCircle01Icon,
  Logout03Icon,
  Mail01Icon,
  Menu01Icon,
  News01Icon,
  PackageIcon,
  User03Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'

type NavEntry = { href: string; labelKey: I18nKey; icon: IconSvgElement }

const SHEET_EXIT_MS = 200

const BROWSE_ITEMS: NavEntry[] = [
  { href: '/', labelKey: 'header.nav.home', icon: Home01Icon },
  { href: '/products', labelKey: 'header.nav.products', icon: FlowerIcon },
  { href: '/b2b', labelKey: 'header.nav.b2b', icon: Building03Icon }
]

const COMPANY_ITEMS: NavEntry[] = [
  { href: '/about', labelKey: 'header.nav.about', icon: InformationCircleIcon },
  { href: '/news', labelKey: 'header.nav.news', icon: News01Icon },
  { href: '/recruitment', labelKey: 'header.nav.recruitment', icon: Briefcase01Icon },
  { href: '/contact', labelKey: 'header.nav.contact', icon: Mail01Icon }
]

interface MobileNavSheetProps {
  me?: Me | null
  isGettingMe: boolean
  isAuthenticated: boolean
  canUseStorefront: boolean
  isActive: (href: string) => boolean
  languageSwitcher: React.ReactNode
}

export default function MobileNavSheet({
  me,
  isGettingMe,
  isAuthenticated,
  canUseStorefront,
  isActive,
  languageSwitcher
}: MobileNavSheetProps) {
  const { t, locale } = useTranslation()
  const { signOut, isSigningOut } = useSignOut()
  const router = useRouter()
  const signInHref = useAuthHref('/sign-in')

  const [open, setOpen] = useState(false)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current)
    },
    []
  )

  const navigate = useCallback(
    (href: Parameters<typeof router.push>[0]) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (isModifiedClick(event)) return

      event.preventDefault()
      setOpen(false)

      if (exitTimer.current) clearTimeout(exitTimer.current)
      exitTimer.current = setTimeout(() => router.push(href), SHEET_EXIT_MS)
    },
    [router]
  )

  const accountHref = useAccountHref()
  const ordersHref = useAccountHref('orders')
  const studioHref = useAccountHref('studio')
  const infoHref = useAccountHref('info')
  const addressHref = useAccountHref('address')

  const accountItems: NavEntry[] = [
    { href: ordersHref, labelKey: 'account.nav.orders', icon: PackageIcon },
    { href: studioHref, labelKey: 'account.nav.studio', icon: AiMagicIcon },
    { href: infoHref, labelKey: 'account.nav.profile', icon: User03Icon },
    { href: addressHref, labelKey: 'account.nav.addresses', icon: Location01Icon }
  ]

  const fullName = formatFullName(me, locale)
  const identityHref = canUseStorefront ? accountHref : '/'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className='lg:hidden'>
        <Button
          size='icon-lg'
          className='size-11 border-none ring ring-primary ring-inset'
          aria-label={t('header.aria.openMenu')}
        >
          <HugeiconsIcon icon={Menu01Icon} className='size-5' />
        </Button>
      </SheetTrigger>

      <SheetContent
        side='right'
        showCloseButton={false}
        className='flex h-[100dvh] flex-col gap-0 p-0 data-[side=right]:w-[min(22rem,92vw)] data-[side=right]:sm:max-w-none'
      >
        <div className='flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-3'>
          <SheetTitle asChild>
            <span className='font-title text-base font-semibold text-primary'>{t('header.menu.title')}</span>
          </SheetTitle>

          <SheetClose asChild>
            <Button variant='ghost' size='icon-lg' className='size-11 rounded-full bg-secondary'>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className='size-5' />
              <span className='sr-only'>{t('header.aria.closeMenu')}</span>
            </Button>
          </SheetClose>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4'>
          {isGettingMe && !me ? (
            <Skeleton className='h-18 w-full rounded-2xl' />
          ) : isAuthenticated && me ? (
            <Link
              href={identityHref}
              onClick={navigate(identityHref)}
              className='flex items-center gap-3 rounded-2xl bg-secondary/40 p-3 ring-1 ring-foreground/5 transition-colors hover:bg-secondary/60'
            >
              <Avatar className='size-11 shrink-0 rounded-full ring-2 ring-primary ring-offset-1'>
                <AvatarImage src={me.avatar || undefined} alt='' />
                <AvatarFallback className='rounded-full text-sm'>
                  {getNameInitials(me, locale)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-primary'>{fullName || t('header.menu.account')}</p>
                <p className='truncate text-xs text-muted-foreground'>{me.phoneNumber ?? me.email}</p>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className='size-5 shrink-0 text-muted-foreground' />
            </Link>
          ) : (
            <div className='rounded-2xl bg-secondary/40 p-4 ring-1 ring-foreground/5'>
              <p className='font-title text-sm font-bold text-primary'>{t('header.menu.guestTitle')}</p>
              <p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>{t('header.menu.guestSubtitle')}</p>
              <div className='mt-3 flex flex-col gap-2'>
                <Button asChild size='lg' className='w-full'>
                  <Link href={signInHref} onClick={navigate(signInHref)}>
                    {t('auth.signIn.label')}
                    <HugeiconsIcon icon={LoginCircle01Icon} />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <NavGroup label={t('header.menu.browse')} items={BROWSE_ITEMS} isActive={isActive} onNavigate={navigate} />

          {isAuthenticated && canUseStorefront ? (
            <NavGroup label={t('header.menu.account')} items={accountItems} onNavigate={navigate} />
          ) : null}

          <NavGroup label={t('header.menu.company')} items={COMPANY_ITEMS} isActive={isActive} onNavigate={navigate} />
        </div>

        <div className='flex shrink-0 flex-col gap-3 border-t border-border/70 px-4 pt-3 pb-safe-sheet'>
          <div className='flex items-center justify-between gap-3'>
            <span className='text-xs font-medium text-muted-foreground'>{t('header.menu.language')}</span>
            {languageSwitcher}
          </div>

          {isAuthenticated ? (
            <Button
              type='button'
              variant='outline'
              size='lg'
              onClick={() => signOut()}
              disabled={isSigningOut}
              className='w-full justify-center'
            >
              <HugeiconsIcon icon={Logout03Icon} />
              {t('account.logout')}
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NavGroup({
  label,
  items,
  isActive,
  onNavigate
}: {
  label: string
  items: NavEntry[]
  onNavigate: (href: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => void
  isActive?: (href: string) => boolean
}) {
  const { t } = useTranslation()

  return (
    <nav aria-label={label} className='mt-5'>
      <h2 className='px-2 pb-1.5 text-sm font-semibold text-muted-foreground'>{label}</h2>
      <ul className='flex flex-col'>
        {items.map((item) => {
          const active = isActive?.(item.href) ?? false
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate(item.href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-2xl px-2 text-sm font-medium transition-colors',
                  active ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground hover:bg-muted'
                )}
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <HugeiconsIcon icon={item.icon} strokeWidth={1.75} className='size-4.5' />
                </span>
                <span className='min-w-0 flex-1 truncate'>{t(item.labelKey)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
