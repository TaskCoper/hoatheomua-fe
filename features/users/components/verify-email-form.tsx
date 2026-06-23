'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { useCountdown } from '@/hooks/use-countdown'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useResendCode } from '../hooks/use-resend-code'
import { useVerifyEmail } from '../hooks/use-verify-email'
import { type VerifyEmailFormValues } from '../validations'

interface VerifyEmailFormProps {
  email: string
  onSuccess?: () => void
}

export default function VerifyEmailForm({ email, onSuccess }: VerifyEmailFormProps) {
  const { t } = useTranslation()

  const { verifyEmailMethods, verifyEmail, isVerifyingEmail } = useVerifyEmail({ email })
  const { resendCode, isResendingCode } = useResendCode()
  const { timeLeft, canResend, resetCountdown } = useCountdown({ seconds: 30, autoStart: true })

  const onVerifyEmail: SubmitHandler<VerifyEmailFormValues> = (data) => {
    verifyEmail(
      { body: data },
      {
        onSuccess: () => {
          onSuccess?.()
        }
      }
    )
  }

  const handleResend = () => {
    if (!canResend || isResendingCode) return
    resendCode({ email })
    resetCountdown()
  }

  return (
    <FormProvider {...verifyEmailMethods}>
      <form
        onSubmit={verifyEmailMethods.handleSubmit(onVerifyEmail)}
        className='flex flex-col items-center gap-2 w-fit'
      >
        <Controller
          control={verifyEmailMethods.control}
          name='code'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
                pattern={REGEXP_ONLY_DIGITS}
                aria-invalid={fieldState.invalid}
                autoFocus
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className='size-11 text-base sm:size-12 sm:text-lg' />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <div className='flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center'>
          <Button
            type='button'
            variant='outline'
            disabled={!canResend || isResendingCode}
            onClick={handleResend}
            className='w-full sm:w-auto'
          >
            {isResendingCode ? <Spinner /> : null}
            {t('auth.verifyEmail.resend')} {!canResend ? `(${timeLeft})` : null}
          </Button>

          <Button type='submit' disabled={isVerifyingEmail} className='w-full sm:w-auto'>
            {isVerifyingEmail ? <Spinner /> : null}
            {t('auth.verifyEmail.submit')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
