'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { clearSessionHint } from '@/shared/session-hint'
import { createPasswordSchema, PASSWORD_MIN_LENGTH } from '@/shared/validations'
import { useForwardedAuthHref } from '../hooks/use-auth-href'
import { usePhoneOtp } from '../hooks/use-phone-otp'
import { normalizePhoneNumber } from '../phone-number'
import { phoneOtpError } from '../otp-error'
import userService from '../services'
import { PhoneOtpFields } from './phone-otp-fields'

export default function ForgotPasswordFlow() {
  const { t } = useTranslation()
  const signInHref = useForwardedAuthHref('/sign-in')
  const queryClient = useQueryClient()
  const otp = usePhoneOtp()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [completed, setCompleted] = useState(false)
  const reset = useMutation({ mutationFn: userService.resetPhonePassword, retry: false })
  const busy = otp.isPending || reset.isPending
  async function requestCode() {
    if (!normalizePhoneNumber(phone)) { toast.error(t('auth.phone.invalidPhone')); return }
    try {
      await otp.mutateAsync({ phoneNumber: phone, purpose: 'reset_password' })
      setCode('')
    } catch (error) { toast.error(phoneOtpError(error, t)) }
  }
  return <form className='mt-4 space-y-4' onSubmit={async event => {
    event.preventDefault()
    if (busy) return
    if (!otp.data) { await requestCode(); return }
    const validation = createPasswordSchema(t, t('auth.signUp.password')).safeParse(password)
    if (!validation.success) { toast.error(validation.error.issues[0].message); return }
    if (password !== confirmation) { toast.error(t('common.validation.passwordMismatch')); return }
    try {
      await reset.mutateAsync({ phoneNumber: phone, challengeId: otp.data.challengeId, code, newPassword: password })
      clearSessionHint()
      queryClient.clear()
      setPassword(''); setConfirmation(''); setCode(''); setCompleted(true)
    } catch (error) { toast.error(phoneOtpError(error, t)) }
  }}>
    {completed ? <p role='status'>{t('auth.phone.resetSuccess')}</p> : <>
      <Field>
        <FieldLabel htmlFor='recovery-phone'>{t('auth.phone.phoneNumber')}</FieldLabel>
        <Input id='recovery-phone' type='tel' autoComplete='tel' value={phone} onChange={event => setPhone(event.target.value)}
          disabled={busy || !!otp.data} required maxLength={32} />
      </Field>
      {otp.data && <>
        <PhoneOtpFields phone={phone} code={code} setCode={setCode} remaining={otp.remaining} busy={busy} onResend={() => void requestCode()} />
        <Field>
          <FieldLabel htmlFor='recovery-password'>{t('auth.phone.newPassword')}</FieldLabel>
          <Input id='recovery-password' type='password' autoComplete='new-password' value={password} onChange={event => setPassword(event.target.value)} required minLength={PASSWORD_MIN_LENGTH} maxLength={128} disabled={busy} />
        </Field>
        <Field>
          <FieldLabel htmlFor='recovery-confirm'>{t('auth.signUp.confirmPassword')}</FieldLabel>
          <Input id='recovery-confirm' type='password' autoComplete='new-password' value={confirmation} onChange={event => setConfirmation(event.target.value)} required maxLength={128} disabled={busy} />
        </Field>
      </>}
      <Button className='w-full' disabled={busy || (!!otp.data && code.length !== 6)}>{otp.data ? t('auth.phone.resetPassword') : t('auth.phone.otpSend')}</Button>
      {otp.data && <Button type='button' variant='ghost' className='w-full' disabled={busy} onClick={() => { otp.reset(); setCode('') }}>{t('auth.phone.editDetails')}</Button>}
    </>}
    <Button asChild variant='link' className='w-full'><Link href={signInHref} replace>{t('auth.signIn.title')}</Link></Button>
  </form>
}
