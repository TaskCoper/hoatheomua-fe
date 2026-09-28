import AuthPageShell from '@/features/users/components/auth-page-shell'
import SignUpProvider from '@/features/users/components/sign-up-provider'
import type { Locale } from '@/lib/i18n/routing'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

interface SignUpPageProps {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: SignUpPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.signUp' })

  return { title: t('title'), robots: { index: false, follow: false } }
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params

  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'auth.signUp' })

  return (
    <AuthPageShell locale={locale}>
      <div className='space-y-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>{t('title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('description')}</p>
        </div>

        <SignUpProvider />
      </div>
    </AuthPageShell>
  )
}
