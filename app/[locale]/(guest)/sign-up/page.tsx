'use client'

import SignUpProvider from '@/features/auth/components/sign-up-provider'
import { useTranslation } from '@/lib/i18n/dictionary-provider'

export default function SignUpPage() {
  const { t } = useTranslation()

  return (
    <main className='mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4'>
      <div className='space-y-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>{t('auth.signUp.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('auth.signUp.description')}</p>
        </div>

        <SignUpProvider />
      </div>
    </main>
  )
}
