'use client'

import { GENERATED_FLOWERS_QUERY_PREFIX } from '@/features/studio/hooks/use-get-generated-flowers'
import aiFlowerService from '@/features/studio/services'
import {
  STUDIO_GENERATION_DONE_STAGE,
  STUDIO_GENERATION_PENDING_STAGE,
  STUDIO_GENERATION_STAGE_INTERVAL
} from '@/features/studio/studio-data'
import type { AiFlower } from '@/features/studio/types'
import { createRegenerateStudioSchema, type RegenerateStudioFormValues } from '@/features/studio/validations'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { toast } from 'sonner'

interface RegenerateAiFlowerProps {
  flowerId: string
  onRegenerated: (flower: AiFlower) => void
}

export const useRegenerateAiFlower = ({ flowerId, onRegenerated }: RegenerateAiFlowerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const regenerateSchema = useMemo(() => createRegenerateStudioSchema(t), [t])
  const methods = useForm<RegenerateStudioFormValues>({
    resolver: zodResolver(regenerateSchema),
    defaultValues: { bundleId: '', mockupId: '' }
  })

  const [generationStage, setGenerationStage] = useState(0)

  const { mutate: regenerateAiFlower, isPending: isRegeneratingAiFlower } = useMutation({
    mutationFn: aiFlowerService.regenerateAiFlower,
    onSuccess: async (flower) => {
      setGenerationStage(STUDIO_GENERATION_DONE_STAGE)
      // The new version only exists on the server, so the session has to be read back.
      await queryClient.invalidateQueries({ queryKey: GENERATED_FLOWERS_QUERY_PREFIX })
      onRegenerated(flower)
    },
    onError: (error) => {
      setGenerationStage(0)
      toast.error(t('studio.generation.error'), { description: error.response?.data?.detail })
    }
  })

  // Walk the cosmetic stages, then park on the last one until the request answers.
  useEffect(() => {
    if (!isRegeneratingAiFlower) return

    const interval = window.setInterval(
      () => setGenerationStage((current) => Math.min(current + 1, STUDIO_GENERATION_PENDING_STAGE)),
      STUDIO_GENERATION_STAGE_INTERVAL
    )

    return () => window.clearInterval(interval)
  }, [isRegeneratingAiFlower])

  const onInvalid = (errors: FieldErrors<RegenerateStudioFormValues>) => {
    const message = Object.values(errors)
      .map((error) => error?.message)
      .find((value): value is string => typeof value === 'string')

    toast.error(t('studio.generation.error'), { description: message ?? t('common.validation.fixErrors') })
  }

  const regenerate = methods.handleSubmit((body) => {
    if (!flowerId) return

    setGenerationStage(0)
    regenerateAiFlower({ flowerId, body })
  }, onInvalid)

  return { methods, regenerate, generationStage, isRegeneratingAiFlower }
}
