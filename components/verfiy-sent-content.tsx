'use client'

import VerifyEmailForm from '@/features/users/components/verify-email-form'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import emailImage from '@/public/images/emailBigIcon.png'
import Image from 'next/image'

function EmailIcon() {
  return (
    <div className='relative mx-auto mb-6 flex w-full justify-center'>
      <Image
        src={emailImage}
        alt=''
        aria-hidden
        priority={false}
        className='h-auto w-[45%] max-w-[24rem] object-contain'
      />
    </div>
  )
}

export default function VerifySentContent({ email }: { email: string }) {
  const { t } = useTranslation()

  return (
    <>
      <EmailIcon />

      <div className='space-y-2'>
        <h1 className='font-title text-xl font-bold leading-tight text-primary sm:text-3xl'>
          {t('auth.verifyEmail.title')}
        </h1>
        <p className='mx-auto w-[80%] break-words text-xs leading-5 text-primary sm:text-[13px] sm:leading-6'>
          {t('auth.verifyEmail.description')} <span className='font-bold'>{email}</span>
        </p>
      </div>

      <div className='my-5 flex w-1/2 items-center gap-3 text-secondary'>
        <span className='h-px flex-1 bg-secondary/70' />
        <svg aria-hidden='true' viewBox='0 0 64 18' fill='none' className='h-4 w-14 text-secondary'>
          <path d='M31.5 8.7c-5.7-5.2-11.3-5.2-16.8 0 5.6 5.3 11.2 5.3 16.8 0Z' fill='currentColor' />
          <path d='M32.5 8.7c5.7-5.2 11.3-5.2 16.8 0-5.6 5.3-11.2 5.3-16.8 0Z' fill='currentColor' />
          <path d='M32 15V4' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
        </svg>
        <span className='h-px flex-1 bg-secondary/70' />
      </div>

      <VerifyEmailForm email={email} />
    </>
  )
}
