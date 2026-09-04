'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { SparkleDivider } from '@/shared/components/sparkle-dividier'
import { cn } from '@/shared/utils'
import {
  CustomerSupportIcon,
  Home01Icon,
  LockPasswordIcon,
  Logout03Icon,
  PackageIcon,
  User03Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { buildAccountHref, isAccountSection, type AccountSection } from '../account-navigation'
import { useGetMe } from '../hooks/use-get-me'
import { useSignOut } from '../hooks/use-sign-out'

export type AccountNavKey = AccountSection | 'cart' | 'support'

interface AccountNavItem {
  key: AccountNavKey
  label: string
  icon: typeof PackageIcon
  href: string
}

interface AccountShellProps {
  active: AccountNavKey
  onSelectSection: (section: AccountSection) => void
  slug?: string
  children: React.ReactNode
}

export default function AccountShell({ active, onSelectSection, slug: slugFromRoute, children }: AccountShellProps) {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()
  const { signOut, isSigningOut } = useSignOut()

  const slug = slugFromRoute ?? me?.slug

  const primaryItems: AccountNavItem[] = [
    { key: 'orders', label: t('account.nav.orders'), icon: PackageIcon, href: buildAccountHref(slug, 'orders') },
    { key: 'info', label: t('account.nav.profile'), icon: User03Icon, href: buildAccountHref(slug, 'info') },
    { key: 'address', label: t('account.nav.addresses'), icon: Home01Icon, href: buildAccountHref(slug, 'address') },
    {
      key: 'password',
      label: t('account.nav.security'),
      icon: LockPasswordIcon,
      href: buildAccountHref(slug, 'password')
    }
  ]

  const secondaryItems: AccountNavItem[] = [
    { key: 'support', label: t('account.nav.support'), icon: CustomerSupportIcon, href: '/contact' }
  ]

  const fullName = me ? `${me.lastName} ${me.firstName}`.trim() : ''

  return (
    <section className='relative px-4 pt-4 pb-12 sm:pt-6 md:pt-8 lg:pt-10'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-5 sm:gap-6'>
        <header className='flex flex-col gap-1.5'>
          <div className='flex items-center gap-3'>
            <h1 className='shrink-0 font-title text-2xl font-bold md:text-3xl lg:text-4xl'>{t('account.title')}</h1>
            <SparkleDivider
              className='hidden min-w-0 flex-1 sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          {isGettingMe && !me ? (
            <Skeleton className='h-4 w-64 max-w-full rounded-full bg-card ring-1 ring-foreground/5' />
          ) : me ? (
            <p className='flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground sm:text-sm'>
              <span className='font-semibold text-foreground'>{fullName || t('profile.notProvided')}</span>
              <span aria-hidden='true' className='text-foreground/30'>
                •
              </span>
              <span className='wrap-break-word'>{me.email}</span>
            </p>
          ) : null}
        </header>

        <div className='grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]'>
          <AccountNav
            active={active}
            primaryItems={primaryItems}
            secondaryItems={secondaryItems}
            signOutLabel={t('account.logout')}
            navLabel={t('account.nav.label')}
            onSelectSection={onSelectSection}
            onSignOut={() => signOut()}
            isSigningOut={isSigningOut}
          />

          <div className='flex min-w-0 flex-col gap-4'>{children}</div>
        </div>
      </div>
    </section>
  )
}

export function AccountSectionHeader({ title, description }: { title: string; description?: React.ReactNode }) {
  return (
    <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'>
      <h2 className='font-title text-lg font-bold sm:text-xl'>{title}</h2>
      {description ? <p className='text-xs text-muted-foreground sm:text-sm'>{description}</p> : null}
    </div>
  )
}

export function AccountSectionSurface({ children }: { children: React.ReactNode }) {
  return <div className='rounded-3xl bg-card p-3 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] sm:p-4'>{children}</div>
}

interface AccountNavProps {
  active: AccountNavKey
  primaryItems: AccountNavItem[]
  secondaryItems: AccountNavItem[]
  signOutLabel: string
  navLabel: string
  onSelectSection: (section: AccountSection) => void
  onSignOut: () => void
  isSigningOut: boolean
}

function AccountNav({
  active,
  primaryItems,
  secondaryItems,
  signOutLabel,
  navLabel,
  onSelectSection,
  onSignOut,
  isSigningOut
}: AccountNavProps) {
  return (
    <nav aria-label={navLabel} className='min-w-0 lg:sticky lg:top-24 lg:self-start'>
      <ul className='hidden flex-col gap-1 rounded-3xl bg-card p-2 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 lg:flex'>
        {primaryItems.map((item) => (
          <li key={item.key}>
            <AccountNavLink item={item} isActive={item.key === active} onSelectSection={onSelectSection} />
          </li>
        ))}

        <li aria-hidden='true' className='my-1 h-px bg-border/70' />

        {secondaryItems.map((item) => (
          <li key={item.key}>
            <AccountNavLink item={item} isActive={item.key === active} onSelectSection={onSelectSection} />
          </li>
        ))}

        <li>
          <button
            type='button'
            onClick={onSignOut}
            disabled={isSigningOut}
            className='flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-2 py-2 text-left text-sm font-medium text-foreground/80 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50'
          >
            <span className='grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground'>
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={1.75} className='size-4' />
            </span>
            <span className='min-w-0 truncate'>{signOutLabel}</span>
          </button>
        </li>
      </ul>

      <div className='-mx-4 overflow-x-auto px-4 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        <ul className='flex w-max items-center gap-2 pb-1'>
          {[...primaryItems, ...secondaryItems].map((item) => (
            <li key={item.key}>
              <AccountNavChip item={item} isActive={item.key === active} onSelectSection={onSelectSection} />
            </li>
          ))}

          <li>
            <button
              type='button'
              onClick={onSignOut}
              disabled={isSigningOut}
              className='inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-card px-3 py-2 text-xs font-medium text-foreground/80 shadow-[0_0.3rem_1rem_rgb(81_108_108/6%)] ring-1 ring-foreground/5 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50'
            >
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={1.75} className='size-4' />
              {signOutLabel}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

interface AccountNavItemProps {
  item: AccountNavItem
  isActive: boolean
  onSelectSection: (section: AccountSection) => void
}

/**
 * Section entries keep their href - middle-click, ctrl-click and "copy link" all
 * behave - but a plain left click swaps the panel instead of navigating. `cart`
 * and `support` are real routes, so they get no handler.
 */
const sectionClickHandler = ({ item, onSelectSection }: Omit<AccountNavItemProps, 'isActive'>) => {
  const section = isAccountSection(item.key) ? item.key : null
  if (!section) return undefined

  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return

    event.preventDefault()
    onSelectSection(section)
  }
}

function AccountNavLink({ item, isActive, onSelectSection }: AccountNavItemProps) {
  const handleClick = sectionClickHandler({ item, onSelectSection })

  return (
    <Link
      href={item.href}
      // Section links are intercepted before they navigate, so prefetching the
      // route they point at would only ever be wasted.
      prefetch={handleClick ? false : undefined}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-2xl px-2 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
        isActive ? 'bg-secondary/50 font-semibold text-secondary-foreground' : 'text-foreground/80 hover:bg-muted'
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full transition-colors',
          isActive ? 'bg-secondary text-primary ring-1 ring-primary/15' : 'bg-muted text-muted-foreground'
        )}
      >
        <HugeiconsIcon icon={item.icon} strokeWidth={1.75} className='size-4' />
      </span>
      <span className='min-w-0 truncate'>{item.label}</span>
    </Link>
  )
}

function AccountNavChip({ item, isActive, onSelectSection }: AccountNavItemProps) {
  const handleClick = sectionClickHandler({ item, onSelectSection })

  return (
    <Link
      href={item.href}
      // Section links are intercepted before they navigate, so prefetching the
      // route they point at would only ever be wasted.
      prefetch={handleClick ? false : undefined}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium whitespace-nowrap shadow-[0_0.3rem_1rem_rgb(81_108_108/6%)] ring-1 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
        isActive
          ? 'bg-secondary font-semibold text-secondary-foreground ring-primary/15'
          : 'bg-card text-foreground/80 ring-foreground/5 hover:bg-muted'
      )}
    >
      <HugeiconsIcon icon={item.icon} strokeWidth={1.75} className='size-4' />
      {item.label}
    </Link>
  )
}
