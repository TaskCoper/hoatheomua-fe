'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useGetMe } from '../hooks/use-get-me'
import { useGetUser } from '../hooks/use-get-user'
import { useUpdateMe } from '../hooks/use-update-me'
import { createUpdateMeSchema, type UpdateMeFormValues } from '../validations'

const defaultValues: UpdateMeFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  avatar: '',
  coverImageUrl: '',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  domainIds: [],
}

export function PersonalInfoForm({ slug }: { slug?: string }) {
  return <PersonalInfoFormInner slug={slug} />
}

interface PersonalInfoFormInnerProps {
  slug?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PersonalInfoFormInner({ slug, onSuccess, onCancel }: PersonalInfoFormInnerProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => createUpdateMeSchema(t), [t])
  const { me, isGettingMe } = useGetMe()
  const { user, isLoading: isLoadingUser } = useGetUser(slug ?? me?.slug)
  const { updateMe, isUpdatingMe } = useUpdateMe()

  const methods = useForm<UpdateMeFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  })

  const profile = user

  useEffect(() => {
    if (!profile) return

    methods.reset({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      avatar: profile.avatar ?? '',
      coverImageUrl: profile.coverImageUrl ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      timeZone: profile.timeZone ?? defaultValues.timeZone,
      domainIds: [],
    })
  }, [methods, profile])

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await updateMe(values)
      toast.success(t('profile.personalInfoUpdated'))
      onSuccess?.()
    } catch (error) {
      toast.error(t('error.somethingWentWrong'), {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  })

  const isLoading = isGettingMe || isLoadingUser
  const isPending = isUpdatingMe

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='h-14 rounded-xl bg-muted/40' />
        ))}
      </div>
    )
  }

  return (
    <form className='space-y-4' onSubmit={onSubmit}>
      <div className='grid gap-3 md:grid-cols-2'>
        <Controller
          name='firstName'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.firstName')}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
            </Field>
          )}
        />
        <Controller
          name='lastName'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.lastName')}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
            </Field>
          )}
        />
      </div>

      <Controller
        name='email'
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-0.5'>
            <FieldLabel htmlFor={field.name}>{t('profile.email')}</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete='email' />
            <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
          </Field>
        )}
      />

      <Controller
        name='avatar'
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-0.5'>
            <FieldLabel htmlFor={field.name}>{t('profile.avatar')}</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder='https://...' />
            <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
          </Field>
        )}
      />

      <Controller
        name='coverImageUrl'
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-0.5'>
            <FieldLabel htmlFor={field.name}>{t('profile.coverImageUrl')}</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder='https://...' />
            <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
          </Field>
        )}
      />

      <div className='grid gap-3 md:grid-cols-2'>
        <Controller
          name='phoneNumber'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.phoneNumber')}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
            </Field>
          )}
        />
        <Controller
          name='timeZone'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.timeZone')}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
            </Field>
          )}
        />
      </div>

      <Controller
        name='address'
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-0.5'>
            <FieldLabel htmlFor={field.name}>{t('profile.address')}</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
            <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
          </Field>
        )}
      />

      <div className='grid gap-3 md:grid-cols-2'>
        <Controller
          name='city'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.city')}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
            </Field>
          )}
        />
        <Controller
          name='state'
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.state')}</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <div className='min-h-4'>{fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}</div>
            </Field>
          )}
        />
      </div>

      <div className='flex items-center justify-end gap-3 border-t pt-4'>
        {onCancel ? (
          <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
            {t('common.button.cancel')}
          </Button>
        ) : null}
        <Button type='submit' disabled={isPending}>
          {isPending ? <Spinner /> : null}
          {t('common.button.save')}
        </Button>
      </div>
    </form>
  )
}
