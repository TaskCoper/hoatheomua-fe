'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useChangePassword } from '../hooks/use-change-password'
import { createChangePasswordSchema, type ChangePasswordFormValues } from '../validations'

const defaultValues: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

export function ChangePasswordForm() {
  const { t } = useTranslation()
  const [isCurrentVisible, setIsCurrentVisible] = useState(false)
  const [isNewVisible, setIsNewVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const schema = useMemo(() => createChangePasswordSchema(t), [t])
  const { resetPassword, isResettingPassword } = useChangePassword()

  const methods = useForm<ChangePasswordFormValues>({
    defaultValues,
    resolver: zodResolver(schema)
  })

  const onSubmit = methods.handleSubmit(async (formValues) => {
    const { confirmPassword, ...values } = formValues
    void confirmPassword

    try {
      await resetPassword(values)
      methods.reset(defaultValues)
      toast.success(t('profile.passwordUpdated'))
    } catch (error) {
      toast.error(t('error.somethingWentWrong'), {
        description: error instanceof Error ? error.message : undefined
      })
    }
  })

  return (
    <form className='space-y-4' onSubmit={onSubmit}>
      <div className='space-y-3'>
        <Controller
          name='currentPassword'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.currentPassword')}</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type={isCurrentVisible ? 'text' : 'password'}
                  autoComplete='current-password'
                />
                <InputGroupAddon align='inline-end'>
                  <HugeiconsIcon
                    icon={isCurrentVisible ? ViewOffSlashIcon : ViewIcon}
                    className='size-4 cursor-pointer'
                    onClick={() => setIsCurrentVisible((prev) => !prev)}
                  />
                </InputGroupAddon>
              </InputGroup>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='newPassword'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.newPassword')}</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type={isNewVisible ? 'text' : 'password'}
                  autoComplete='new-password'
                />
                <InputGroupAddon align='inline-end'>
                  <HugeiconsIcon
                    icon={isNewVisible ? ViewOffSlashIcon : ViewIcon}
                    className='size-4 cursor-pointer'
                    onClick={() => setIsNewVisible((prev) => !prev)}
                  />
                </InputGroupAddon>
              </InputGroup>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='confirmPassword'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.confirmNewPassword')}</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type={isConfirmVisible ? 'text' : 'password'}
                  autoComplete='new-password'
                />
                <InputGroupAddon align='inline-end'>
                  <HugeiconsIcon
                    icon={isConfirmVisible ? ViewOffSlashIcon : ViewIcon}
                    className='size-4 cursor-pointer'
                    onClick={() => setIsConfirmVisible((prev) => !prev)}
                  />
                </InputGroupAddon>
              </InputGroup>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      <div className='flex items-center justify-end gap-3 border-t pt-4'>
        <Button type='submit' disabled={isResettingPassword}>
          {isResettingPassword ? <Spinner /> : null}
          {t('profile.changePassword')}
        </Button>
      </div>
    </form>
  )
}
