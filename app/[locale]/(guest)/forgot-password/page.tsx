import AuthPageShell from '@/features/users/components/auth-page-shell'
import ForgotPasswordFlow from '@/features/users/components/forgot-password-flow'
import type { Locale } from '@/lib/i18n/routing'
import { LockPasswordIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

interface ForgotPasswordPageProps {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: ForgotPasswordPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.forgotPassword' })

  return { title: t('title'), robots: { index: false, follow: false } }
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params

  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'auth.forgotPassword' })

  return (
    <AuthPageShell locale={locale}>
      <div className='text-center items-center'>
        <div className='mb-1 mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10'>
          <HugeiconsIcon icon={LockPasswordIcon} className='text-primary' />
        </div>
        <div className='space-y-1 text-center'>
          <h1 className='text-2xl font-semibold'>{t('title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('description')}</p>
        </div>

        <ForgotPasswordFlow />
      </div>
    </AuthPageShell>
  )
}
