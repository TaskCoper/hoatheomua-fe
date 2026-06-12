import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { SignUpFormValues } from '../validations'

export default function SignUpForm() {
  const { t } = useTranslation()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const { control } = useFormContext<SignUpFormValues>()

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev)
  }

  return (
    <FieldGroup className='gap-2'>
      <Controller
        name='firstName'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signUp.firstName')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('auth.signUp.firstNamePlaceholder')}
              autoComplete='given-name'
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='lastName'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signUp.lastName')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('auth.signUp.lastNamePlaceholder')}
              autoComplete='family-name'
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='email'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signUp.email')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('auth.signUp.emailPlaceholder')}
              autoComplete='email'
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='password'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signUp.password')}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t('auth.signUp.passwordPlaceholder')}
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete='new-password'
              />
              <InputGroupAddon align='inline-end'>
                {isPasswordVisible ? (
                  <HugeiconsIcon
                    icon={ViewOffSlashIcon}
                    className='size-4 cursor-pointer'
                    onClick={togglePasswordVisibility}
                  />
                ) : (
                  <HugeiconsIcon icon={ViewIcon} className='size-4 cursor-pointer' onClick={togglePasswordVisibility} />
                )}
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
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signUp.confirmPassword')}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                autoComplete='new-password'
              />
              <InputGroupAddon align='inline-end'>
                {isConfirmPasswordVisible ? (
                  <HugeiconsIcon
                    icon={ViewOffSlashIcon}
                    className='size-4 cursor-pointer'
                    onClick={toggleConfirmPasswordVisibility}
                  />
                ) : (
                  <HugeiconsIcon
                    icon={ViewIcon}
                    className='size-4 cursor-pointer'
                    onClick={toggleConfirmPasswordVisibility}
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
    </FieldGroup>
  )
}
