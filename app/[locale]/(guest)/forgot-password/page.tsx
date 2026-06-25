'use client'

import ForgotPasswordFlow from '@/features/users/components/forgot-password-flow'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { LockPasswordIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()

  return (
    <main className='mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4'>
      <div className='text-center items-center'>
        <div className='mb-1 mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10'>
          <HugeiconsIcon icon={LockPasswordIcon} className='text-primary' />
        </div>
        <div className='space-y-1 text-center'>
          <h1 className='text-2xl font-semibold'>{t('auth.forgotPassword.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('auth.forgotPassword.description')}</p>
        </div>

        <ForgotPasswordFlow />
      </div>
    </main>
  )
}
