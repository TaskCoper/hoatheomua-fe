'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useResendEmail } from '@/features/auth/hooks/use-resend-email'
import { useVerify } from '@/features/auth/hooks/use-verify'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import downLeftCorner from '@/public/images/DownLeftCorner-removebg-preview.png'
import downRightCorner from '@/public/images/DownRightCorner-removebg-preview.png'
import emailImage from '@/public/images/emailBigIcon.png'
import upperLeftCorner from '@/public/images/UpperLeftCorner-removebg-preview.png'
import upperRightCorner from '@/public/images/UpperRightCorner-removebg-preview.png'
import { cn } from '@/shared/utils'
import Image, { type StaticImageData } from 'next/image'
import { useEffect, useRef } from 'react'
import FloatingPetals from '../../(public)/_components/floating-petals'

type CornerImageProps = {
  src: StaticImageData
  alt: string
  className: string
}

function DecorativeCornerImage({ src, alt, className }: CornerImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      aria-hidden
      priority={false}
      className={cn('pointer-events-none absolute z-0 select-none object-contain', className)}
    />
  )
}

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

  const { email } = useResendEmail()
  const actualEmail = email?.trim()
  const displayEmail = actualEmail || t('auth.verifyEmailPending.fallbackEmail')
  const { token, handleVerifyEmail, isVerifyingEmail, isVerifySuccess } = useVerify()

  const hasVerifiedRef = useRef(false)
  useEffect(() => {
    if (hasVerifiedRef.current) return
    if (!token) return

    hasVerifiedRef.current = true
    handleVerifyEmail()
  }, [token, handleVerifyEmail])

  return (
    <main className='relative isolate flex h-svh overflow-hidden bg-[#EBF0EC] px-4 py-4 text-[#3F5352] sm:px-6 sm:py-5 lg:px-8'>
      <div className='z-0'>
        <FloatingPetals />
      </div>
      <DecorativeCornerImage
        src={upperLeftCorner}
        alt=''
        className='wind-wiggle-left left-0 z-30 top-0 w-36 -translate-x-6 -translate-y-4 sm:w-56 lg:w-72 xl:w-80'
      />
      <DecorativeCornerImage
        src={upperRightCorner}
        alt=''
        className=' wind-wiggle-right right-0 z-30 top-0 w-40 translate-x-5 -translate-y-6 sm:w-60 lg:w-80 xl:w-96'
      />
      <DecorativeCornerImage
        src={downLeftCorner}
        alt=''
        className='wind-wiggle-left bottom-0 z-30 left-0 w-40 -translate-x-7 translate-y-5 sm:w-60 lg:w-72 xl:w-80'
      />
      <DecorativeCornerImage
        src={downRightCorner}
        alt=''
        className=' wind-wiggle-right bottom-0 z-30 right-0 w-40 translate-x-6 translate-y-6 sm:w-60 lg:w-72 xl:w-80'
      />

      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-2 pt-1 text-sm font-medium text-[#4F6765] sm:gap-3 sm:text-[15px]' />
      </div>

      <div className='mx-auto mt-2 flex w-[92%] max-w-[45rem] flex-col items-center justify-center text-center sm:mt-3'>
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
          {isVerifyingEmail ? (
            <>
              <Spinner className='mr-2' />
              {t('auth.verifyEmailPending.verifying')}
            </>
          ) : isVerifySuccess ? (
            t('auth.verifyEmailPending.success')
          ) : (
            t('auth.verifyEmailPending.verifying')
          )}
        </Button>
      </div>
    </main>
  )
}
