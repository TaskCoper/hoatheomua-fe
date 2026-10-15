'use client'

import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useSignIn } from '../hooks/use-sign-in'
import { usePhoneOtp } from '../hooks/use-phone-otp'
import { normalizePhoneNumber } from '../phone-number'
import { phoneOtpError } from '../otp-error'
import { PhoneOtpFields } from './phone-otp-fields'

export default function SignInProvider() {
  const { t } = useTranslation()
  const { signIn, isSigningIn } = useSignIn()
  const otp = usePhoneOtp()
  const id = useId()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const busy = otp.isPending || isSigningIn

  async function requestCode() {
    if (busy || otp.remaining > 0) return
    const normalized = normalizePhoneNumber(phone)
    if (!normalized) {
      toast.error(t('auth.phone.invalidPhone'))
      return
    }
    try {
      await otp.mutateAsync({ phoneNumber: normalized, purpose: 'login' })
      setPhone(normalized)
      setCode('')
    } catch (error) {
      toast.error(phoneOtpError(error, t))
    }
  }

  return (
    <form
      className='space-y-4'
      onSubmit={(event) => {
        event.preventDefault()
        if (busy) return
        if (!otp.data) {
          void requestCode()
          return
        }
        if (!/^[0-9]{6}$/.test(code)) return
        signIn({ body: { phoneNumber: phone, challengeId: otp.data.challengeId, code } })
      }}
    >
      <Field>
        <FieldLabel htmlFor={id}>{t('auth.phone.phoneNumber')}</FieldLabel>
        <Input
          id={id}
          type='tel'
          inputMode='tel'
          autoComplete='tel'
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          maxLength={32}
          placeholder={t('auth.phone.placeholder')}
          disabled={busy || !!otp.data}
        />
      </Field>
      {otp.data && (
        <PhoneOtpFields
          phone={phone}
          code={code}
          setCode={setCode}
          remaining={otp.remaining}
          busy={busy}
          onResend={() => void requestCode()}
        />
      )}
      <Button className='w-full' disabled={busy || (otp.data ? code.length !== 6 : otp.remaining > 0)}>
        {busy && <Spinner />}
        {otp.data
          ? t('auth.signIn.submit')
          : otp.remaining > 0
            ? t('auth.phone.otpResendCountdown', { seconds: otp.remaining })
            : t('auth.phone.otpSend')}
      </Button>
      {otp.data ? (
        <Button
          type='button'
          variant='ghost'
          className='w-full'
          disabled={busy}
          onClick={() => {
            otp.reset()
            setCode('')
          }}
        >
          {t('auth.phone.editDetails')}
        </Button>
      ) : (
        <p className='text-center text-sm text-muted-foreground'>{t('auth.phone.autoCreateAccount')}</p>
      )}
    </form>
  )
}
