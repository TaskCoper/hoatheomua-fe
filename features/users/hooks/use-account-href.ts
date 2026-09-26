'use client'

import { buildAccountHref, type AccountSection } from '../account-navigation'
import { useGetMe } from './use-get-me'

export const useAccountHref = (section?: AccountSection) => {
  const { me } = useGetMe()

  return buildAccountHref(me?.slug, section)
}
