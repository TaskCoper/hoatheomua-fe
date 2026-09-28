import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import orderService from '../services'

export const useResolveGeocodePlace = () => {
  const { t } = useTranslation()

  const { mutateAsync: resolveGeocodePlace, isPending: isResolvingGeocodePlace } = useMutation({
    mutationFn: orderService.resolveGeocodePlace,
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { resolveGeocodePlace, isResolvingGeocodePlace }
}
