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
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { AddCircleIcon, Attachment01Icon, CloudUploadIcon, Delete02Icon, SentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler, useFormContext } from 'react-hook-form'

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
  attachments: []
})

export default function ApplyJobDialog({ job, children }: ApplyJobDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { methods, sendRequest, isSendingRequest } = useCreateRecruitmentRequest()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const [pendingFiles, setPendingFiles] = useState<Array<File | null>>([null])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      methods.reset(getDefaultValues(job))
      setPendingFiles([null])
    }

    setOpen(nextOpen)
  }

  const isSubmitting = isSendingRequest || isUploading

  const handleSubmit: SubmitHandler<CreateRecruitmentRequest> = async (values) => {
    const files = pendingFiles.filter((file): file is File => file !== null)
    const urls = await Promise.all(files.map((file) => uploadFileWithToast({ file, showSuccessToast: false })))
    if (urls.some((url) => !url)) return
    const attachments = urls as string[]

    const body: SendRecruitmentRequestForm = {
      jobDescriptionId: values.jobDescriptionId,
      title: values.title,
      coverLetter: values.coverLetter,
      attachments
    }

    sendRequest(
      { body },
      {
        onSuccess: () => {
          methods.reset(getDefaultValues(job))
          setPendingFiles([null])
          setOpen(false)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='overflow-y-auto min-w-[95%] lg:min-w-3xl' position='top-center'>
        <DialogHeader>
          <DialogTitle>Đơn xin việc</DialogTitle>
          <DialogDescription>Nhập các thông tin cơ bản để nộp đơn ứng tuyển cho vị trí này.</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} className='space-y-5'>
            <ApplyJobFields isSubmitting={isSubmitting} pendingFiles={pendingFiles} setPendingFiles={setPendingFiles} />

            <DialogFooter className='gap-2 pt-1'>
              <Button type='button' variant='outline' disabled={isSubmitting} onClick={() => setOpen(false)}>
                {t('recruitment.applyDialog.cancel')}
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : <HugeiconsIcon icon={SentIcon} strokeWidth={1.8} className='size-4' />}
                {t('recruitment.applyDialog.submit')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

interface ApplyJobFieldsProps {
  isSubmitting: boolean
  pendingFiles: Array<File | null>
  setPendingFiles: React.Dispatch<React.SetStateAction<Array<File | null>>>
}

function ApplyJobFields({ isSubmitting, pendingFiles, setPendingFiles }: ApplyJobFieldsProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<CreateRecruitmentRequest>()

  return (
    <FieldGroup className='gap-3'>
      <Controller
        name='title'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1.5'>
            <FieldLabel htmlFor={field.name}>{t('recruitment.applyDialog.fields.roleTitle')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              disabled={isSubmitting}
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
            <FieldLabel>{t('recruitment.applyDialog.fields.coverLetter')}</FieldLabel>
            <RichTextEditor
              compact
              content={field.value}
              onChange={field.onChange}
              invalid={fieldState.invalid}
              error={fieldState.error}
              className='min-h-60 text-sm'
            />
          </Field>
        )}
      />

      <AttachmentFields isSubmitting={isSubmitting} pendingFiles={pendingFiles} setPendingFiles={setPendingFiles} />
    </FieldGroup>
  )
}

interface AttachmentFieldsProps {
  isSubmitting: boolean
  pendingFiles: Array<File | null>
  setPendingFiles: React.Dispatch<React.SetStateAction<Array<File | null>>>
}

function AttachmentFields({ isSubmitting, pendingFiles, setPendingFiles }: AttachmentFieldsProps) {
  const { t } = useTranslation()

  const appendRow = () => setPendingFiles((prev) => [...prev, null])
  const removeRow = (index: number) => setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  const setFileAt = (index: number, file: File) =>
    setPendingFiles((prev) => {
      const next = [...prev]
      next[index] = file
      return next
    })

  return (
    <Field className='gap-2'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <FieldLabel>{t('recruitment.applyDialog.fields.attachments')}</FieldLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isSubmitting}
          onClick={appendRow}
          className='h-8 gap-1.5 rounded-full px-3'
        >
          <HugeiconsIcon icon={AddCircleIcon} strokeWidth={1.8} className='size-4' />
          {t('recruitment.applyDialog.addAttachment')}
        </Button>
      </div>

      <div className='space-y-2'>
        {pendingFiles.map((file, index) => (
          <AttachmentRow
            key={index}
            file={file}
            isSubmitting={isSubmitting}
            canRemove={pendingFiles.length > 1}
            onSelectFile={(picked) => setFileAt(index, picked)}
            onRemove={() => removeRow(index)}
          />
        ))}
      </div>
    </Field>
  )
}

interface AttachmentRowProps {
  file: File | null
  isSubmitting: boolean
  canRemove: boolean
  onSelectFile: (file: File) => void
  onRemove: () => void
}

function AttachmentRow({ file, isSubmitting, canRemove, onSelectFile, onRemove }: AttachmentRowProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0]
    event.target.value = ''
    if (!picked) return
    onSelectFile(picked)
  }

  return (
    <Field className='gap-1'>
      <div className='flex gap-2'>
        <input ref={fileInputRef} type='file' className='hidden' onChange={handleFileChange} />
        {file && previewUrl ? (
          <Button asChild variant='outline' className='h-10 flex-1 justify-start gap-2 bg-input/40 px-3.5 font-normal'>
            <a href={previewUrl} target='_blank' rel='noopener noreferrer'>
              <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.8} className='size-4 shrink-0' />
              <span className='truncate'>{file.name}</span>
            </a>
          </Button>
        ) : (
          <Button
            type='button'
            variant='outline'
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
            className='h-10 flex-1 justify-start gap-2 bg-input/40 px-3.5 font-normal'
          >
            <HugeiconsIcon icon={CloudUploadIcon} strokeWidth={1.8} className='size-4 shrink-0' />
            <span className='truncate text-muted-foreground'>{t('recruitment.applyDialog.attachmentPlaceholder')}</span>
          </Button>
        )}
        <Button
          type='button'
          variant='outline'
          size='icon-lg'
          disabled={isSubmitting || !canRemove}
          onClick={onRemove}
          aria-label={t('recruitment.applyDialog.removeAttachment')}
          className='shrink-0 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive'
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} className='size-4' />
        </Button>
      </div>
    </Field>
  )
}
