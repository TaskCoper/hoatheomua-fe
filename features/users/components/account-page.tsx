'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { AccountOrders } from '@/features/orders/components/account-orders'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { isAccountSection, type AccountSection } from '../account-navigation'
import { useGetMe } from '../hooks/use-get-me'
import AccountShell, { AccountSectionHeader, AccountSectionSurface } from './account-shell'

function SectionLoading() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className='h-15.5 w-full rounded-lg' />
      ))}
    </div>
  )
}

// Only the panels behind a click are split out - `orders` is the landing section,
// so lazy-loading it would just trade a request for a flash of skeleton.
const AddressContent = dynamic(() => import('./account-sections').then((m) => m.AddressContent), {
  loading: SectionLoading
})

const PasswordContent = dynamic(() => import('./account-sections').then((m) => m.PasswordContent), {
  loading: SectionLoading
})

const PersonalInfoContent = dynamic(() => import('./account-sections').then((m) => m.PersonalInfoContent), {
  loading: SectionLoading
})

export default function AccountPage({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { me } = useGetMe()
  const searchParams = useSearchParams()

  // Someone else's profile only ever shows their public info: every other panel
  // renders the *viewer's* own orders, addresses and password form.
  const isOwnAccount = !me?.slug || me.slug === slug

  const paramSection = searchParams.get('section') ?? undefined
  const requestedSection = isAccountSection(paramSection) ? paramSection : undefined
  const activeSection: AccountSection = isOwnAccount ? (requestedSection ?? 'orders') : 'info'

  // Panels are already mounted client-side, so the URL is updated through the
  // History API rather than the router: same shareable link and back button, but
  // no RSC round-trip or Suspense fallback just to move between sections.
  const handleSelectSection = useCallback(
    (next: AccountSection) => {
      if (!isOwnAccount) return

      const url = new URL(window.location.href)
      url.searchParams.set('section', next)
      window.history.pushState(null, '', url)
    },
    [isOwnAccount]
  )

  return (
    <AccountShell active={activeSection} onSelectSection={handleSelectSection} slug={slug}>
      {activeSection === 'orders' ? (
        <AccountOrders />
      ) : activeSection === 'info' ? (
        <>
          <AccountSectionHeader title={t('profile.personalInfoTitle')} />
          <AccountSectionSurface>
            <PersonalInfoContent slug={slug} />
          </AccountSectionSurface>
        </>
      ) : activeSection === 'address' ? (
        <>
          <AccountSectionHeader title={t('profile.addressListTitle')} />
          <AccountSectionSurface>
            <AddressContent slug={slug} />
          </AccountSectionSurface>
        </>
      ) : (
        <>
          <AccountSectionHeader title={t('profile.changePasswordTitle')} />
          <AccountSectionSurface>
            <PasswordContent />
          </AccountSectionSurface>
        </>
      )}
    </AccountShell>
  )
}
