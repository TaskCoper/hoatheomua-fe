'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ARE_CARDS_ENABLED } from '@/features/orders/cards/card-feature'
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
const AccountStudioGenerations = dynamic(() => import('@/features/studio/components/account-studio-generations'), {
  loading: SectionLoading
})

const AccountCardGenerations = dynamic(() => import('@/features/orders/components/account-card-generations'), {
  loading: SectionLoading
})

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
  const isRequestedSectionAvailable =
    (requestedSection !== 'cards' || ARE_CARDS_ENABLED) &&
    (requestedSection !== 'password' || (!!me && me.registrationMethod !== 'Phone'))
  const activeSection: AccountSection = isOwnAccount
    ? isRequestedSectionAvailable
      ? (requestedSection ?? 'orders')
      : 'orders'
    : 'info'

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
      ) : activeSection === 'studio' ? (
        <AccountStudioGenerations />
      ) : activeSection === 'cards' ? (
        <AccountCardGenerations />
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
