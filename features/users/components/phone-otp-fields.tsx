import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useId } from 'react'

export function PhoneOtpFields({ phone, code, setCode, remaining, busy, onResend }: {
  phone: string; code: string; setCode: (code: string) => void; remaining: number; busy: boolean; onResend: () => void
}) {
  const { t } = useTranslation()
  const id = useId()
  return <div className='space-y-3'>
    <p className='text-sm text-muted-foreground' role='status'>{t('auth.phone.otpInstructions', { phone })}</p>
    <Field>
      <FieldLabel htmlFor={id}>{t('auth.phone.otpLabel')}</FieldLabel>
      <Input id={id} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode='numeric' autoComplete='one-time-code' pattern='[0-9]{6}' minLength={6} maxLength={6} required disabled={busy} autoFocus />
    </Field>
    <Button type='button' variant='outline' className='w-full' disabled={busy || remaining > 0} onClick={onResend}>
      {remaining > 0 ? t('auth.phone.otpResendCountdown', { seconds: remaining }) : t('auth.phone.otpResend')}
    </Button>
  </div>
}
