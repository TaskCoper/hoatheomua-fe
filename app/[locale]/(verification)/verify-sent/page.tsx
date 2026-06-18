'use client'

import { Button } from '@/components/ui/button'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useResendEmail } from '@/features/auth/hooks/use-resend-email'
import { getRoleHomePath, getUserType } from '@/features/auth/utils'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useRouter } from '@/lib/i18n/navigation'
import emailImage from '@/public/images/emailBigIcon.png'
import Image from 'next/image'
import { useEffect } from 'react'

function EmailIcon() {
  return (
    <div className='relative mx-auto flex w-full justify-center mb-8'>
      <Image
        src={emailImage}
        alt=''
        aria-hidden
        priority={false}
        className='h-auto w-[60%] max-w-[36rem] object-contain'
      />
    </div>
  )
}

export default function EmailPendingPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { handleResendEmail, isResendingEmail, email } = useResendEmail()
  const { me, isGettingMe } = useGetMe()
  const userHomePath = getRoleHomePath(getUserType(me))

  useEffect(() => {
    if (!email && !isGettingMe) {
      router.replace(userHomePath)
    }
  }, [email, isGettingMe, router, userHomePath])

  if (!email) return null

  return (
    <>
      <EmailIcon />

      <div className='mt-0 space-y-2'>
        <h1 className='font-title text-xl font-bold leading-tight text-primary sm:text-3xl'>
          {t('auth.verifyEmailPending.title')}
        </h1>
        <div className='mx-auto w-[60%] space-y-1.5 text-center text-xs leading-5 text-[#4F6765] sm:text-[13px] sm:leading-6'>
          <p className='break-words text-primary'>
            {t('auth.verifyEmailPending.preInstruct')} <span className='font-bold text-primary'>{email}</span>{' '}
            {t('auth.verifyEmailPending.postInstruct')}.
          </p>
        </div>
      </div>

      <div className='my-3 flex w-1/2 items-center gap-3 text-secondary'>
        <span className='h-px flex-1 bg-secondary/70' />
        <svg aria-hidden='true' viewBox='0 0 64 18' fill='none' className='h-4 w-14 text-secondary'>
          <path d='M31.5 8.7c-5.7-5.2-11.3-5.2-16.8 0 5.6 5.3 11.2 5.3 16.8 0Z' fill='currentColor' />
          <path d='M32.5 8.7c5.7-5.2 11.3-5.2 16.8 0-5.6 5.3-11.2 5.3-16.8 0Z' fill='currentColor' />
          <path d='M32 15V4' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
        </svg>
        <span className='h-px flex-1 bg-secondary/70' />
      </div>

      <p className='mt-3 max-w-[24rem] text-xs leading-5 text-muted-foreground sm:text-[13px] sm:leading-6'>
        {t('auth.verifyEmailPending.spamHint')}
        <Button variant='link' onClick={handleResendEmail} disabled={isResendingEmail} className='p-0'>
          {t('auth.verifyEmailPending.resend')}
        </Button>
        .
      </p>
    </>
  )
}
