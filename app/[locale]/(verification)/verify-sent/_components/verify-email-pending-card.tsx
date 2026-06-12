'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useResendEmail } from '@/features/auth/hooks/use-resend-email'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import downLeftCorner from '@/public/images/DownLeftCorner-removebg-preview.png'
import downRightCorner from '@/public/images/DownRightCorner-removebg-preview.png'
import emailImage from '@/public/images/emailBigIcon.png'
import logo from '@/public/images/logo.png'
import upperLeftCorner from '@/public/images/UpperLeftCorner-removebg-preview.png'
import upperRightCorner from '@/public/images/UpperRightCorner-removebg-preview.png'
import verifyEmailFlower from '@/public/images/VerifyEmailContactFlower.png'
import { cn } from '@/shared/utils'
import Image, { type StaticImageData } from 'next/image'
import FloatingPetals from '../../../(public)/_components/floating-petals'

type VerifyEmailPendingCardProps = {
  email?: string
}

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

function EnvelopeCheckIcon() {
  return (
    <div className='relative mx-auto flex w-full justify-center'>
      <Image
        src={emailImage}
        alt=''
        aria-hidden
        priority={false}
        className='h-auto w-56 object-contain sm:w-72 lg:w-80'
      />
    </div>
  )
}
export default function VerifyEmailPendingCard({ email }: VerifyEmailPendingCardProps) {
  const { t } = useTranslation()

  const actualEmail = email?.trim()
  const displayEmail = actualEmail || t('auth.verifyEmailPending.fallbackEmail')
  const { handleResendEmail, isResendingEmail } = useResendEmail()

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

      <section className='relative z-10 mx-auto my-auto grid w-full max-w-6xl gap-4 rounded-[2rem] bg-[#FFFDF8]/95 p-4 shadow-[0_2rem_5rem_rgba(63,83,82,0.16)] ring-1 ring-white/75 sm:rounded-[2.25rem] sm:p-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-5 lg:rounded-[2.5rem] lg:p-5'>
        <div className='flex min-h-0 flex-col px-2 py-1 sm:px-5 lg:px-6 lg:py-4'>
          <div className='flex items-start justify-between gap-4'>
            <Link href='/' aria-label='Hoa Theo Mùa' className='inline-flex'>
              <Image src={logo} alt='Hoa Theo Mùa' priority className='h-auto w-24 sm:w-28' />
            </Link>

            <div className='flex items-center gap-2 pt-1 text-sm font-medium text-[#4F6765] sm:gap-3 sm:text-[15px]'>
              <span className='hidden sm:inline'>{t('auth.verifyEmailPending.changedMind')}</span>
              <Button
                asChild
                variant='outline'
                className='h-9 rounded-full border-primary/60 bg-transparent px-4 text-primary shadow-none hover:bg-secondary/30 hover:text-primary'
              >
                <Link href='/'>{t('auth.verifyEmailPending.goBack')}</Link>
              </Button>
            </div>
          </div>

          <div className='mx-auto flex w-full max-w-[27rem] flex-1 flex-col items-center justify-center py-5 text-center sm:py-6 lg:py-4'>
            <EnvelopeCheckIcon />

            <div className='mt-1 space-y-3'>
              <h1 className='font-title text-3xl font-medium leading-tight text-primary sm:text-4xl'>
                {t('auth.verifyEmailPending.title')}
              </h1>
              <div className='space-y-2 text-sm leading-6 text-[#4F6765] sm:text-base'>
                <p>{t('auth.verifyEmailPending.sentTo')}</p>
                <p className='break-words font-semibold text-[#314746]'>{displayEmail}</p>
                <p>{t('auth.verifyEmailPending.instruction')}</p>
              </div>
            </div>

            <div className='my-5 flex w-full items-center gap-3 text-secondary'>
              <span className='h-px flex-1 bg-secondary/70' />
              <svg aria-hidden='true' viewBox='0 0 64 18' fill='none' className='h-4 w-14 text-secondary'>
                <path d='M31.5 8.7c-5.7-5.2-11.3-5.2-16.8 0 5.6 5.3 11.2 5.3 16.8 0Z' fill='currentColor' />
                <path d='M32.5 8.7c5.7-5.2 11.3-5.2 16.8 0-5.6 5.3-11.2 5.3-16.8 0Z' fill='currentColor' />
                <path d='M32 15V4' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
              </svg>
              <span className='h-px flex-1 bg-secondary/70' />
            </div>

            {/* TODO: connect resend verification email API when backend contract is available */}
            <Button
              onClick={handleResendEmail}
              disabled={isResendingEmail}
              className='h-10 w-full rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_0.875rem_1.75rem_rgba(81,108,108,0.22)] disabled:opacity-100 sm:text-base'
            >
              {isResendingEmail ? <Spinner /> : null}
              {t('auth.verifyEmailPending.resend')}
            </Button>

            <p className='mt-4 max-w-[24rem] text-sm leading-5 text-muted-foreground sm:text-[15px] sm:leading-6'>
              {t('auth.verifyEmailPending.spamHint')}
            </p>

            <Link
              href='/sign-up'
              className='mt-4 text-sm font-semibold text-primary underline underline-offset-4 sm:text-base'
            >
              {t('auth.verifyEmailPending.changeEmail')}
            </Link>
          </div>

          <p className='mt-4 text-xs text-[#637A77] sm:text-sm'>{t('auth.verifyEmailPending.footer')}</p>
        </div>
        <div className='relative min-h-[320px] overflow-hidden rounded-[2rem] bg-secondary/25 sm:min-h-[400px] lg:min-h-0 lg:rounded-[2.25rem]'>
          <Image
            src={verifyEmailFlower}
            alt='Hoa trắng Hoa Theo Mùa'
            fill
            priority
            sizes='(min-width: 1024px) 48vw, 92vw'
            className='object-cover'
          />
          <div className='absolute inset-x-4 bottom-4 rounded-[1.75rem] border border-white/25 bg-primary/55 px-5 py-5 text-center text-white shadow-[0_1.25rem_3rem_rgba(31,53,52,0.22)] backdrop-blur-[4px] sm:inset-x-8 sm:bottom-6 sm:px-8 sm:py-6'>
            <p className='font-title text-xs font-semibold uppercase tracking-[0.08em] sm:text-sm'>
              {t('auth.verifyEmailPending.quoteLabel')}
            </p>

            <div className='mx-auto my-2 flex max-w-40 items-center gap-2 text-white/70'>
              <span className='h-px flex-1 bg-current' />
              <svg aria-hidden='true' viewBox='0 0 36 10' fill='none' className='h-2.5 w-8'>
                <path d='M17.5 5c-3.6-3.3-7.2-3.3-10.8 0 3.6 3.3 7.2 3.3 10.8 0Z' fill='currentColor' />
                <path d='M18.5 5c3.6-3.3 7.2-3.3 10.8 0-3.6 3.3-7.2 3.3-10.8 0Z' fill='currentColor' />
              </svg>
              <span className='h-px flex-1 bg-current' />
            </div>

            <p className='whitespace-pre-line font-title text-2xl font-medium leading-tight [text-shadow:0_2px_12px_rgba(31,53,52,0.35)] sm:text-3xl lg:text-4xl'>
              {t('auth.verifyEmailPending.quote')}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
