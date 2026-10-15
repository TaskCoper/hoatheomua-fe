'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { FormProvider } from 'react-hook-form'
import { useForwardedAuthHref } from '../hooks/use-auth-href'
import { useSignUp } from '../hooks/use-sign-up'
import { usePhoneOtp } from '../hooks/use-phone-otp'
import { phoneOtpError } from '../otp-error'
import type { SignUpFormValues } from '../validations'
import SignUpForm from './sign-up-form'
import { PhoneOtpFields } from './phone-otp-fields'

export default function SignUpProvider() {
  const { t } = useTranslation()
  const { methods, signUp, isSigningUp } = useSignUp()
  const signInHref = useForwardedAuthHref('/sign-in')
  const otp = usePhoneOtp()
  const [pending, setPending] = useState<SignUpFormValues | null>(null)
  const [code, setCode] = useState('')
  const busy = isSigningUp || otp.isPending
  async function requestCode(body: SignUpFormValues) {
    try {
      await otp.mutateAsync({ phoneNumber: body.phoneNumber, purpose: 'register' })
      setPending(body)
      setCode('')
    } catch (error) { toast.error(phoneOtpError(error, t)) }
  }
  return <FormProvider {...methods}>
    <form className='space-y-6' onSubmit={pending ? event => {
      event.preventDefault()
      if (!busy && otp.data && /^[0-9]{6}$/.test(code)) signUp({ body: { ...pending, challengeId: otp.data.challengeId, code } })
    } : methods.handleSubmit(requestCode)}>
      {pending ? <PhoneOtpFields phone={pending.phoneNumber} code={code} setCode={setCode} remaining={otp.remaining}
        busy={busy} onResend={() => void requestCode(pending)} /> : <fieldset disabled={busy}><SignUpForm /></fieldset>}
      <div className='space-y-2'>
        <Button className='w-full' disabled={busy || (!!pending && code.length !== 6)}>
          {busy ? <Spinner /> : null}
          {pending ? t('auth.signUp.submit') : t('auth.phone.otpSend')}
        </Button>
        {pending && <Button type='button' variant='ghost' className='w-full' disabled={busy} onClick={() => { setPending(null); setCode(''); otp.reset() }}>
          {t('auth.phone.editDetails')}
        </Button>}
        <Link href={signInHref} replace className='block text-center text-sm text-muted-foreground'>{t('auth.signUp.signUpPrompt')}</Link>
      </div>
    </form>
  </FormProvider>
}
