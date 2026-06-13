import api, { type BaseResponse } from '@/lib/axios'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface GetPresignedUrlParams {
  key: string
  contentType: string
}

interface GetPresignedUrlResponse {
  presignedUrl: string
  contentType: string
  uploadMethod: 'PUT' | 'POST'
  requiredHeaders: string[]
  instructions: string
}

export const useGetPresignedUrl = () => {
  const { t } = useTranslation()

  const {
    mutate: getPresignedUrl,
    mutateAsync: getPresignedUrlAsync,
    isPending: isGettingPresignedUrl
  } = useMutation({
    mutationFn: async ({ key, contentType }: GetPresignedUrlParams) => {
      const { data } = await api.get<BaseResponse<GetPresignedUrlResponse>>('/v1/storages/presigned-url', {
        params: {
          key,
          contentType
        }
      })

      return data.value
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { getPresignedUrl, getPresignedUrlAsync, isGettingPresignedUrl }
}
