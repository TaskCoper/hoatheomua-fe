import { useMutation } from '@tanstack/react-query'
import orderService from '../services'

export const useReverseGeocode = () => {
  const { mutateAsync: reverseGeocode, isPending: isReverseGeocoding } = useMutation({
    mutationFn: orderService.reverseGeocode
  })

  return { reverseGeocode, isReverseGeocoding }
}
