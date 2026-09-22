'use client'

import { useFlowerJob } from './use-flower-job'
import { toCreateAiFlowerPayload } from '@/features/studio/studio-mappers'
import type { AiFlower, CreateAiFlowerPayload } from '@/features/studio/types'
import { createStudioSchema, type StudioFormValues } from '@/features/studio/validations'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { toast } from 'sonner'

interface CreateAiFlowerProps {
  defaultValues: StudioFormValues
  onCreated: (flower: AiFlower, body: CreateAiFlowerPayload) => void
}

export const useCreateAiFlower = ({ defaultValues, onCreated }: CreateAiFlowerProps) => {
  const { t } = useTranslation()

  const studioSchema = useMemo(() => createStudioSchema(t), [t])
  const methods = useForm<StudioFormValues>({ resolver: zodResolver(studioSchema), defaultValues })

  const [submittedBody, setSubmittedBody] = useState<CreateAiFlowerPayload | null>(null)
  const {
    submit,
    generationStage,
    isPending: isCreatingAiFlower
  } = useFlowerJob((job) => {
    if (job.result && submittedBody) onCreated(job.result, submittedBody)
  })

  const onInvalid = (errors: FieldErrors<StudioFormValues>) => {
    const message = Object.values(errors)
      .map((error) => error?.message)
      .find((value): value is string => typeof value === 'string')

    toast.error(t('studio.generation.error'), { description: message ?? t('common.validation.fixErrors') })
  }

  const generate = methods.handleSubmit((values) => {
    if (isCreatingAiFlower) return
    const body = toCreateAiFlowerPayload(values)
    setSubmittedBody(body)
    void submit(body)
  }, onInvalid)

  return { methods, generate, generationStage, isCreatingAiFlower }
}
