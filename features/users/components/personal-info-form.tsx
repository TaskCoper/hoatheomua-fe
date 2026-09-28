'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { CloudUploadIcon, Image01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  domainIds: []
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
  const { uploadFileWithToast: uploadAvatar, isUploading: isUploadingAvatar } = useUploadFileWithToast()
  const { uploadFileWithToast: uploadCover, isUploading: isUploadingCover } = useUploadFileWithToast()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null)
  const [pendingCover, setPendingCover] = useState<File | null>(null)

  const avatarPreview = useMemo(() => (pendingAvatar ? URL.createObjectURL(pendingAvatar) : null), [pendingAvatar])
  const coverPreview = useMemo(() => (pendingCover ? URL.createObjectURL(pendingCover) : null), [pendingCover])

  useEffect(() => {
    if (!avatarPreview) return
    return () => URL.revokeObjectURL(avatarPreview)
  }, [avatarPreview])

  useEffect(() => {
    if (!coverPreview) return
    return () => URL.revokeObjectURL(coverPreview)
  }, [coverPreview])

  const methods = useForm<UpdateMeFormValues>({
    defaultValues,
    resolver: zodResolver(schema)
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
      domainIds: []
    })
  }, [methods, profile])

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      let avatar = values.avatar
      let coverImageUrl = values.coverImageUrl

      if (pendingAvatar) {
        const url = await uploadAvatar({ file: pendingAvatar, showSuccessToast: false })
        if (!url) return
        avatar = url
      }
      if (pendingCover) {
        const url = await uploadCover({ file: pendingCover, showSuccessToast: false })
        if (!url) return
        coverImageUrl = url
      }

      await updateMe({ ...values, avatar, coverImageUrl })
      methods.setValue('avatar', avatar)
      methods.setValue('coverImageUrl', coverImageUrl)
      setPendingAvatar(null)
      setPendingCover(null)
      toast.success(t('profile.personalInfoUpdated'))
      onSuccess?.()
    } catch {}
  })

  const isLoading = isGettingMe || isLoadingUser
  const isPending = isUpdatingMe || isUploadingAvatar || isUploadingCover

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-14 rounded-xl' />
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
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
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
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
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
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='phoneNumber'
        control={methods.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-0.5'>
            <FieldLabel htmlFor={field.name}>{t('profile.phoneNumber')}</FieldLabel>
            <Input {...field} id={field.name} type='tel' aria-invalid={fieldState.invalid} autoComplete='tel' />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='avatar'
        control={methods.control}
        render={({ field, fieldState }) => {
          const displaySrc = avatarPreview ?? field.value
          const hasImage = !!displaySrc
          return (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.avatar')}</FieldLabel>
              <div className='flex items-center gap-3'>
                <div className='relative size-16 shrink-0 overflow-hidden rounded-full border bg-muted'>
                  {hasImage ? (
                    <Image src={displaySrc} alt='' fill className='object-cover' unoptimized sizes='64px' />
                  ) : (
                    <div className='flex size-full items-center justify-center text-muted-foreground'>
                      <HugeiconsIcon icon={Image01Icon} size={20} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  id={field.name}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    e.target.value = ''
                    setPendingAvatar(file)
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isPending}
                >
                  <HugeiconsIcon icon={CloudUploadIcon} size={16} strokeWidth={1.5} />
                  {t('common.button.upload')}
                </Button>
                {hasImage && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setPendingAvatar(null)
                      field.onChange('')
                    }}
                    disabled={isPending}
                  >
                    {t('common.button.remove')}
                  </Button>
                )}
              </div>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )
        }}
      />

      <Controller
        name='coverImageUrl'
        control={methods.control}
        render={({ field, fieldState }) => {
          const displaySrc = coverPreview ?? field.value
          const hasImage = !!displaySrc
          return (
            <Field data-invalid={fieldState.invalid} className='gap-0.5'>
              <FieldLabel htmlFor={field.name}>{t('profile.coverImageUrl')}</FieldLabel>
              <div className='space-y-2'>
                <div className='relative h-28 w-full overflow-hidden rounded-xl border bg-muted'>
                  {hasImage ? (
                    <Image
                      src={displaySrc}
                      alt=''
                      fill
                      className='object-cover'
                      unoptimized
                      sizes='(min-width: 768px) 600px, 100vw'
                    />
                  ) : (
                    <div className='flex size-full items-center justify-center text-muted-foreground'>
                      <HugeiconsIcon icon={Image01Icon} size={28} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  id={field.name}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    e.target.value = ''
                    setPendingCover(file)
                  }}
                />
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isPending}
                  >
                    <HugeiconsIcon icon={CloudUploadIcon} size={16} strokeWidth={1.5} />
                    {t('common.button.upload')}
                  </Button>

                  {hasImage && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setPendingCover(null)
                        field.onChange('')
                      }}
                      disabled={isPending}
                    >
                      {t('common.button.remove')}
                    </Button>
                  )}
                </div>
              </div>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )
        }}
      />

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
