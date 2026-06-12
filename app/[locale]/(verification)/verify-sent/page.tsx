'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useResendEmail } from '@/features/auth/hooks/use-resend-email'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import downLeftCorner from '@/public/images/DownLeftCorner-removebg-preview.png'
import downRightCorner from '@/public/images/DownRightCorner-removebg-preview.png'
import emailImage from '@/public/images/emailBigIcon.png'
import upperLeftCorner from '@/public/images/UpperLeftCorner-removebg-preview.png'
import upperRightCorner from '@/public/images/UpperRightCorner-removebg-preview.png'
import { cn } from '@/shared/utils'
import Image, { type StaticImageData } from 'next/image'
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
  const { t } = useTranslation()
  const { handleResendEmail, isResendingEmail, email } = useResendEmail()
  const actualEmail = email?.trim()
  const displayEmail = actualEmail || t('auth.verifyEmailPending.fallbackEmail')

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

      {/* <section className='relative z-10 mx-auto my-auto flex w-full max-w-xl flex-col rounded-[2rem] bg-[#FFFDF8]/95 p-5 text-center shadow-[0_1.5rem_4rem_rgba(63,83,82,0.14)] ring-1 ring-white/75 sm:rounded-[2.25rem] sm:p-6 lg:p-7'> */}
      {/* <div className='flex min-h-0 flex-col'> */}
      <div className='flex items-start justify-between gap-4'>
        {/* <Link href='/' aria-label='Hoa Theo Mùa' className='inline-flex'>
          <Image src={logo} alt='Hoa Theo Mùa' priority className='h-auto w-24 sm:w-28' />
        </Link> */}

        <div className='flex items-center gap-2 pt-1 text-sm font-medium text-[#4F6765] sm:gap-3 sm:text-[15px]'>
          {/* <span className='hidden sm:inline'>{t('auth.verifyEmailPending.changedMind')}</span> */}
          {/* <Button
            asChild
            variant='outline'
            className='h-9 rounded-full border-primary/60 bg-transparent px-4 text-primary shadow-none hover:bg-secondary/30 hover:text-primary'
          >
            <Link href='/'>{t('auth.verifyEmailPending.goBack')}</Link>
          </Button> */}
        </div>
      </div>

      <div className='mx-auto mt-2 flex w-[92%] max-w-[45rem] flex-col items-center justify-center text-center sm:mt-3'>
        <EmailIcon />

        <div className='mt-0 space-y-2'>
          <h1 className='font-title text-xl font-bold leading-tight text-primary sm:text-3xl'>
            {t('auth.verifyEmailPending.title')}
          </h1>
          <div className='mx-auto w-[60%] space-y-1.5 text-center text-xs leading-5 text-[#4F6765] sm:text-[13px] sm:leading-6'>
            {/* <p>{t('auth.verifyEmailPending.sentTo')}</p> */}
            <p className='break-words text-primary'>
              {t('auth.verifyEmailPending.preInstruct')} <span className='font-bold text-primary'>{displayEmail}</span>{' '}
              {t('auth.verifyEmailPending.postInstruct')}.
            </p>
            {/* <p>{t('auth.verifyEmailPending.instruction')}</p> */}
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

        {/* TODO: connect resend verification email API when backend contract is available */}

        <p className='mt-3 max-w-[24rem] text-xs leading-5 text-muted-foreground sm:text-[13px] sm:leading-6'>
          {t('auth.verifyEmailPending.spamHint')}
          <Button variant='link' onClick={handleResendEmail} disabled={isResendingEmail} className='!p-0'>
            {isResendingEmail ? <Spinner /> : null}
            {t('auth.verifyEmailPending.resend')}
          </Button>
          .
        </p>

        {/* <Link
          href='/sign-up'
          className='mt-3 text-sm font-semibold text-primary underline underline-offset-4 sm:text-base'
        >
          {t('auth.verifyEmailPending.changeEmail')}
        </Link> */}
      </div>

      {/* <p className='mt-4 text-center text-xs text-[#637A77] sm:text-sm'>{t('auth.verifyEmailPending.footer')}</p> */}
      {/* </div> */}
      {/* </section> */}
    </main>
  )
}
