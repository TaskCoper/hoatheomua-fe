'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { useForgotPassword } from '@/features/users/hooks/use-forgot-password'
import { useResetPassword } from '@/features/users/hooks/use-reset-password'
import { useVerifyCode } from '@/features/users/hooks/use-verify-code'
import {
  type ForgotPasswordFormValues,
  type ResetPassWordFormValue,
  type VerifyCodeFormValues
} from '@/features/users/validations'
import { useCountdown } from '@/hooks/use-countdown'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'

type ForgotPasswordFlowProps = {
  onCompleted?: () => void
  handleForgotPassword?: () => void
}

export default function ForgotPasswordFlow({ onCompleted }: ForgotPasswordFlowProps) {
  const { t } = useTranslation()

  const [stage, setStage] = useState<'email' | 'otp' | 'password'>('email')
  const [isVisible, setIsVisible] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { methods: forgotPasswordMethods, forgotPassword, isForgotPasswordPending } = useForgotPassword()
  const { methods: verifyCodeMethods, verifyCode, isVerifyingCode } = useVerifyCode()
  const { methods: resetPasswordMethods, resetPassword, isResettingPassword } = useResetPassword()

  const { timeLeft, canResend, resetCountdown } = useCountdown({
    seconds: 30,
    autoStart: stage === 'otp'
  })

  const resetFlow = () => {
    setStage('email')
    setSubmittedEmail('')
    setIsVisible(false)

    forgotPasswordMethods.reset({
      email: ''
    })

    verifyCodeMethods.reset({
      email: '',
      code: ''
    })

    resetPasswordMethods.reset({
      newPassword: ''
    })
  }

  const handleResend = () => {
    if (!submittedEmail) return

    forgotPassword({ body: { email: submittedEmail } })
    resetCountdown()
  }

  const onSubmitForgotPassword: SubmitHandler<ForgotPasswordFormValues> = (body) => {
    forgotPassword(
      { body },
      {
        onSuccess: () => {
          setSubmittedEmail(body.email)
          setStage('otp')

          verifyCodeMethods.reset({
            email: body.email,
            code: ''
          })
        }
      }
    )
  }

  const onSubmitVerifyCode: SubmitHandler<VerifyCodeFormValues> = (body) => {
    verifyCode(
      { body },
      {
        onSuccess: () => {
          resetPasswordMethods.reset({
            newPassword: ''
          })
          setStage('password')
        }
      }
    )
  }

  const onSubmitResetPassword: SubmitHandler<ResetPassWordFormValue> = (body) => {
    resetPassword(
      { body },
      {
        onSuccess: () => {
          resetFlow()
          onCompleted?.()
        }
      }
    )
  }

  const onInvalidResetPassword = () => {
    toast.error(t('common.validation.fixErrors'))
  }

  const handleBackToEmail = () => {
    setStage('email')
    setSubmittedEmail('')

    forgotPasswordMethods.reset({
      email: ''
    })

    verifyCodeMethods.reset({
      email: '',
      code: ''
    })
  }

  const togglePasswordVisibility = () => {
    setIsVisible((prev) => !prev)
  }

  return (
    <>
      <div>
        {stage === 'email' ? (
          <FormProvider {...forgotPasswordMethods}>
            <form onSubmit={forgotPasswordMethods.handleSubmit(onSubmitForgotPassword)} className='space-y-4'>
              <Controller
                name='email'
                control={forgotPasswordMethods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t('auth.signIn.email')}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder={t('auth.signIn.emailPlaceholder')}
                      autoComplete='email'
                      autoFocus
                    />
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />

              <Button type='submit' className='w-full' disabled={isForgotPasswordPending}>
                {isForgotPasswordPending ? <Spinner /> : null}
                {t('auth.forgotPassword.submit')}
              </Button>
            </form>
          </FormProvider>
        ) : null}

        {stage === 'otp' ? (
          <FormProvider {...verifyCodeMethods}>
            <form onSubmit={verifyCodeMethods.handleSubmit(onSubmitVerifyCode)} className='space-y-4'>
              <div className='text-center text-sm text-muted-foreground'>
                {submittedEmail ? (
                  <span>
                    {t('auth.verifyEmail.sentTo')} <span className='font-medium text-foreground'>{submittedEmail}</span>
                  </span>
                ) : null}
              </div>

              <div className='flex justify-center'>
                <Controller
                  control={verifyCodeMethods.control}
                  name='code'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='mx-auto w-fit items-center gap-1'>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        pattern={REGEXP_ONLY_DIGITS}
                        aria-invalid={fieldState.invalid}
                        autoFocus
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className='size-11 text-base sm:size-12 sm:text-lg'
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>

                      <div className='min-h-4'>
                        {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />
              </div>

              <div className='flex-col gap-2 sm:flex-row'>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  disabled={!canResend || isForgotPasswordPending}
                  onClick={handleResend}
                >
                  {isForgotPasswordPending ? <Spinner /> : null}
                  {t('auth.verifyEmail.resend')} {!canResend ? `(${timeLeft})` : null}
                </Button>

                <Button type='submit' className='w-full' disabled={isVerifyingCode}>
                  {isVerifyingCode ? <Spinner /> : null}
                  {t('auth.verifyEmail.submit')}
                </Button>
              </div>

              <Button type='button' variant='link' className='w-full px-0' onClick={handleBackToEmail}>
                {t('auth.verifyEmail.changeEmail')}
              </Button>
            </form>
          </FormProvider>
        ) : null}

        {stage === 'password' ? (
          <FormProvider {...resetPasswordMethods}>
            <form
              onSubmit={resetPasswordMethods.handleSubmit(onSubmitResetPassword, onInvalidResetPassword)}
              className='space-y-4'
            >
              <Controller
                name='newPassword'
                control={resetPasswordMethods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t('auth.resetPassword.title')}</FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={t('auth.resetPassword.description')}
                        type={isVisible ? 'text' : 'password'}
                        autoComplete='new-password'
                        autoFocus
                      />
                      <InputGroupAddon align='inline-end'>
                        {isVisible ? (
                          <HugeiconsIcon
                            icon={ViewOffSlashIcon}
                            className='size-4 cursor-pointer'
                            onClick={togglePasswordVisibility}
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={ViewIcon}
                            className='size-4 cursor-pointer'
                            onClick={togglePasswordVisibility}
                          />
                        )}
                      </InputGroupAddon>
                    </InputGroup>

                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />

              <Button type='submit' className='w-full' disabled={isResettingPassword}>
                {isResettingPassword ? <Spinner /> : null}
                {t('auth.resetPassword.submit')}
              </Button>
            </form>
          </FormProvider>
        ) : null}
      </div>
    </>
  )
}
