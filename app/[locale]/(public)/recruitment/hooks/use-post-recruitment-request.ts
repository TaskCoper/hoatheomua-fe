import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { recruitmentRequestService } from '../services'
import { CreateRecruitmentRequest, createRecruitmentRequestSchema } from '../validation'

const defaultValues: CreateRecruitmentRequest = {
  jobDescriptionId: '',
  title: '',
  coverLetter: '',
  attachments: [{ value: '' }]
}

export const useCreateRecruitmentRequest = () => {
  const { t } = useTranslation()
  const createRecruitmentSchema = useMemo(() => createRecruitmentRequestSchema(t), [t])

  const methods = useForm<CreateRecruitmentRequest>({
    defaultValues,
    resolver: zodResolver(createRecruitmentSchema)
  })

  const { mutate: sendRequest, isPending: isSendingRequest } = useMutation({
    mutationFn: recruitmentRequestService.postRecruitmentRequest,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, sendRequest, isSendingRequest }
}
