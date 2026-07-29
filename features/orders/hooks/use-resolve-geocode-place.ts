import { useMutation } from '@tanstack/react-query'
import orderService from '../services'

export const useResolveGeocodePlace = () => {
  const { mutateAsync: resolveGeocodePlace, isPending: isResolvingGeocodePlace } = useMutation({
    mutationFn: orderService.resolveGeocodePlace
  })

  return { resolveGeocodePlace, isResolvingGeocodePlace }
}
