'use client'

import SignInProvider from '@/features/users/components/sign-in-provider'
import { useTranslation } from '@/lib/i18n/dictionary-provider'

export default function SignInPage() {
  const { t } = useTranslation()

  return (
    <main className='mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4'>
      <div className='space-y-6'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>{t('auth.signIn.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('auth.signIn.description')}</p>
        </div>

        <SignInProvider />
      </div>
    </main>
  )
}
