'use client'

import aiFlowerService from '@/features/studio/services'
import {
  STUDIO_GENERATION_DONE_STAGE,
  STUDIO_GENERATION_PENDING_STAGE,
  STUDIO_GENERATION_STAGE_INTERVAL
} from '@/features/studio/studio-data'
import { toCreateAiFlowerPayload } from '@/features/studio/studio-mappers'
import type { AiFlower, CreateAiFlowerPayload } from '@/features/studio/types'
import { createStudioSchema, type StudioFormValues } from '@/features/studio/validations'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
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

  const [generationStage, setGenerationStage] = useState(0)

  const { mutate: createAiFlower, isPending: isCreatingAiFlower } = useMutation({
    mutationFn: aiFlowerService.createAiFlower,
    onSuccess: (flower, { body }) => {
      setGenerationStage(STUDIO_GENERATION_DONE_STAGE)
      onCreated(flower, body)
    },
    onError: (error) => {
      setGenerationStage(0)
      toast.error(t('studio.generation.error'), { description: error.response?.data?.detail })
    }
  })

  useEffect(() => {
    if (!isCreatingAiFlower) return

    const interval = window.setInterval(
      () => setGenerationStage((current) => Math.min(current + 1, STUDIO_GENERATION_PENDING_STAGE)),
      STUDIO_GENERATION_STAGE_INTERVAL
    )

    return () => window.clearInterval(interval)
  }, [isCreatingAiFlower])

  const onInvalid = (errors: FieldErrors<StudioFormValues>) => {
    const message = Object.values(errors)
      .map((error) => error?.message)
      .find((value): value is string => typeof value === 'string')

    toast.error(t('studio.generation.error'), { description: message ?? t('common.validation.fixErrors') })
  }

  const generate = methods.handleSubmit((values) => {
    setGenerationStage(0)
    createAiFlower({ body: toCreateAiFlowerPayload(values) })
  }, onInvalid)

  const resetGeneration = () => setGenerationStage(0)

  return { methods, generate, generationStage, isCreatingAiFlower, resetGeneration }
}
