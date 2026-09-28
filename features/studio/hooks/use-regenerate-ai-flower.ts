'use client'

import { useFlowerJob } from './use-flower-job'
import type { AiFlower } from '@/features/studio/types'
import { createRegenerateStudioSchema, type RegenerateStudioFormValues } from '@/features/studio/validations'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { toast } from 'sonner'

interface RegenerateAiFlowerProps {
  flowerId: string
  onRegenerated: (flower: AiFlower) => void
}

export const useRegenerateAiFlower = ({ flowerId, onRegenerated }: RegenerateAiFlowerProps) => {
  const { t } = useTranslation()

  const regenerateSchema = useMemo(() => createRegenerateStudioSchema(t), [t])
  const methods = useForm<RegenerateStudioFormValues>({
    resolver: zodResolver(regenerateSchema),
    defaultValues: { bundleId: '', mockupId: '' }
  })

  const {
    submit,
    generationStage,
    isPending: isRegeneratingAiFlower
  } = useFlowerJob((job) => {
    if (job.result) onRegenerated(job.result)
  })

  const onInvalid = (errors: FieldErrors<RegenerateStudioFormValues>) => {
    const message = Object.values(errors)
      .map((error) => error?.message)
      .find((value): value is string => typeof value === 'string')

    toast.error(t('studio.generation.error'), { description: message ?? t('common.validation.fixErrors') })
  }

  const regenerate = methods.handleSubmit((body) => {
    if (!flowerId) return

    void submit(body, flowerId)
  }, onInvalid)

  return { methods, regenerate, generationStage, isRegeneratingAiFlower }
}
