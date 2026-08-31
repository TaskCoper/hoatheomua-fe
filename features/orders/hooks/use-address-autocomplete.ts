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

  // VietMap occasionally returns the same refId more than once in a single
  // response; dedupe so React keys and cmdk item values stay unique.
  const suggestions = data?.results
    ? Array.from(new Map(data.results.map((suggestion) => [suggestion.refId, suggestion])).values())
    : []

  return { suggestions, isSearchingAddress }
}
