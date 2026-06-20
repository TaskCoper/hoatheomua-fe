import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { AddCircleIcon, Delete02Icon, SentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler, useFieldArray, useFormContext } from 'react-hook-form'

import { useCreateRecruitmentRequest } from '../hooks/use-post-recruitment-request'
import type { Job, SendRecruitmentRequestForm } from '../types'
import type { CreateRecruitmentRequest } from '../validation'

type ApplyJobDialogProps = {
  job: Job
  children: ReactNode
}

const getDefaultValues = (job: Job): CreateRecruitmentRequest => ({
  jobDescriptionId: job.id,
  title: job.title,
  coverLetter: '',
  attachments: [{ value: '' }]
})

const toRequestBody = (values: CreateRecruitmentRequest): SendRecruitmentRequestForm => ({
  jobDescriptionId: values.jobDescriptionId,
  title: values.title,
  coverLetter: values.coverLetter,
  attachments: values.attachments.map((attachment) => attachment.value.trim()).filter(Boolean)
})

export default function ApplyJobDialog({ job, children }: ApplyJobDialogProps) {
  const { locale } = useTranslation()
  const isEnglish = locale === 'en'
  const [open, setOpen] = useState(false)
  const { methods, sendRequest, isSendingRequest } = useCreateRecruitmentRequest()

  useEffect(() => {
    if (open) {
      methods.reset(getDefaultValues(job))
    }
  }, [job, methods, open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      methods.reset(getDefaultValues(job))
    }

    setOpen(nextOpen)
  }

  const handleSubmit: SubmitHandler<CreateRecruitmentRequest> = (values) => {
    sendRequest(
      { body: toRequestBody(values) },
      {
        onSuccess: () => {
          methods.reset(getDefaultValues(job))
          setOpen(false)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl' position='center'>
        <DialogHeader className='pr-10'>
          <DialogTitle>{isEnglish ? 'Apply for this role' : 'Ứng tuyển vị trí này'}</DialogTitle>
          <DialogDescription>{isEnglish ? job.title : `Vị trí: ${job.title}`}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} className='space-y-5'>
            <input type='hidden' {...methods.register('jobDescriptionId')} />

            <ApplyJobFields isEnglish={isEnglish} isSendingRequest={isSendingRequest} />

            <DialogFooter className='gap-2 pt-1'>
              <Button type='button' variant='outline' disabled={isSendingRequest} onClick={() => setOpen(false)}>
                {isEnglish ? 'Cancel' : 'Hủy'}
              </Button>
              <Button type='submit' disabled={isSendingRequest}>
                {isSendingRequest ? (
                  <Spinner />
                ) : (
                  <HugeiconsIcon icon={SentIcon} strokeWidth={1.8} className='size-4' />
                )}
                {isEnglish ? 'Submit application' : 'Gửi ứng tuyển'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

function ApplyJobFields({ isEnglish, isSendingRequest }: { isEnglish: boolean; isSendingRequest: boolean }) {
  const { control } = useFormContext<CreateRecruitmentRequest>()

  return (
    <FieldGroup className='gap-3'>
      <Controller
        name='title'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1.5'>
            <FieldLabel htmlFor={field.name}>{isEnglish ? 'Role title' : 'Vị trí ứng tuyển'}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              disabled={isSendingRequest}
              aria-invalid={fieldState.invalid}
              className='h-10 bg-input/40 px-3.5'
            />
            <div className='min-h-4'>
              {fieldState.invalid ? <FieldError className='text-xs' errors={[fieldState.error]} /> : null}
            </div>
          </Field>
        )}
      />

      <Controller
        name='coverLetter'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1.5'>
            <FieldLabel>{isEnglish ? 'Cover letter' : 'Thư giới thiệu'}</FieldLabel>
            <RichTextEditor
              compact
              content={field.value}
              onChange={field.onChange}
              invalid={fieldState.invalid}
              error={fieldState.error}
              className='min-h-36 max-h-64 text-sm'
            />
          </Field>
        )}
      />

      <AttachmentFields isEnglish={isEnglish} isSendingRequest={isSendingRequest} />
    </FieldGroup>
  )
}

function AttachmentFields({ isEnglish, isSendingRequest }: { isEnglish: boolean; isSendingRequest: boolean }) {
  const { control } = useFormContext<CreateRecruitmentRequest>()
  const { fields, append, remove } = useFieldArray({ control, name: 'attachments' })

  return (
    <Field className='gap-2'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <FieldLabel>{isEnglish ? 'Attachments' : 'Tệp đính kèm'}</FieldLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isSendingRequest}
          onClick={() => append({ value: '' })}
          className='h-8 gap-1.5 rounded-full px-3'
        >
          <HugeiconsIcon icon={AddCircleIcon} strokeWidth={1.8} className='size-4' />
          {isEnglish ? 'Add' : 'Thêm'}
        </Button>
      </div>

      <div className='space-y-2'>
        {fields.map((attachment, index) => (
          <Controller
            key={attachment.id}
            name={`attachments.${index}.value`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <div className='flex gap-2'>
                  <Input
                    {...field}
                    disabled={isSendingRequest}
                    aria-invalid={fieldState.invalid}
                    placeholder={isEnglish ? 'CV or portfolio URL' : 'URL CV hoặc portfolio'}
                    className='h-10 bg-input/40 px-3.5'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon-lg'
                    disabled={isSendingRequest || fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label={isEnglish ? 'Remove attachment' : 'Xóa tệp đính kèm'}
                    className='shrink-0 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive'
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} className='size-4' />
                  </Button>
                </div>
                <div className='min-h-4'>
                  {fieldState.invalid ? <FieldError className='text-xs' errors={[fieldState.error]} /> : null}
                </div>
              </Field>
            )}
          />
        ))}
      </div>
    </Field>
  )
}
