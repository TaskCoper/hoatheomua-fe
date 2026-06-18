'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useVerifyEmail } from '@/features/auth/hooks/use-verify-email'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import emailImage from '@/public/images/emailBigIcon.png'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

function EmailIcon() {
  return (
    <div className='relative mx-auto mb-8 flex w-full justify-center'>
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
export default function EmailVerificationStatusPage() {
  const { t } = useTranslation()
  const { token, verifyEmail } = useVerifyEmail()

  const hasVerifiedRef = useRef(false)

  useEffect(() => {
    if (hasVerifiedRef.current) {
      return
    }
    hasVerifiedRef.current = true

    verifyEmail({ body: { token } })
  }, [token, verifyEmail])

  if (!token) return null

  return (
    <>
      <EmailIcon />

      <div className='mt-0 space-y-2'>
        <h1 className='font-title text-xl font-bold leading-tight text-primary sm:text-3xl'>
          {t('auth.verifyEmailPending.verifyTitle')}
        </h1>
        <div className='mx-auto w-[60%] space-y-1.5 text-center text-xs leading-5 text-[#4F6765] sm:text-[13px] sm:leading-6'>
          <p className='text-primary'>
            {t('auth.verifyEmailPending.sentTo')}
            {'. '}
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

      <Button disabled variant='link'>
        <Spinner />
        {t('auth.verifyEmailPending.verifying')}
      </Button>
    </>
  )
}
