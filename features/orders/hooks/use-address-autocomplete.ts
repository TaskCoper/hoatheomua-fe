import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAddressAutocompleteQuery } from '../queries'

export const useAddressAutocomplete = ({
  text,
  focus,
  ward,
  city,
  enabled = true
}: {
  text: string
  focus?: string
  ward?: string
  city?: string
  enabled?: boolean
}) => {
  const { data, isFetching: isSearchingAddress } = useQuery({
    ...getAddressAutocompleteQuery({ text, focus, ward, city }),
    enabled: enabled && text.trim().length >= 2,
    placeholderData: keepPreviousData
  })

  return { suggestions: data?.results ?? [], isSearchingAddress }
}
