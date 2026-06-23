import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { SignInFormValues } from '../validations'

export default function SignInForm() {
  const { t } = useTranslation()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const { control } = useFormContext<SignInFormValues>()

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  return (
    <FieldGroup className='gap-2'>
      <Controller
        name='email'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signIn.email')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('auth.signIn.emailPlaceholder')}
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
            <FieldLabel htmlFor={field.name}>{t('auth.signIn.password')}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder={t('auth.signIn.passwordPlaceholder')}
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete='current-password'
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
    </FieldGroup>
  )
}
