'use client'

import { useEffect, useMemo } from 'react'

/** A preview URL for a file that has not been uploaded yet, revoked when it changes. */
export const useObjectUrl = (file: File | null): string | null => {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    if (!url) return

    return () => URL.revokeObjectURL(url)
  }, [url])

  return url
}
