import AuthPageShell from '@/features/users/components/auth-page-shell'
import SignInProvider from '@/features/users/components/sign-in-provider'
import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

interface SignInPageProps {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: SignInPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.signIn' })

  return { title: t('title'), robots: { index: false, follow: false } }
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params

  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'auth.signIn' })

  return (
    <AuthPageShell locale={locale}>
      <div className='space-y-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>{t('title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('description')}</p>
        </div>

        <Suspense fallback={null}>
          <SignInProvider />
        </Suspense>
      </div>
    </AuthPageShell>
  )
}
