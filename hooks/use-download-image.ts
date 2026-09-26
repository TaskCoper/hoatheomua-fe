'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

const inferExtension = (blob: Blob, src: string) => {
  const fromUrl = src.split('?')[0].split('.').pop()
  if (fromUrl && /^[a-z0-9]{2,5}$/i.test(fromUrl)) return fromUrl

  const fromType = blob.type.split('/').pop()
  return fromType || 'png'
}

export const useDownloadImage = () => {
  const { t } = useTranslation()
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadImage = useCallback(
    async (src: string, filename = 'image') => {
      setIsDownloading(true)

      try {
        const response = await fetch(src)
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = objectUrl
        link.download = `${filename}.${inferExtension(blob, src)}`
        document.body.appendChild(link)
        link.click()
        link.remove()

        URL.revokeObjectURL(objectUrl)
      } catch {
        // A CDN without CORS headers can't be read back as a blob - a new tab at least lets the
        // user save the picture themselves (long-press / right-click).
        window.open(src, '_blank', 'noopener,noreferrer')
        toast.info(t('common.ui.downloadOpenedInNewTab'))
      } finally {
        setIsDownloading(false)
      }
    },
    [t]
  )

  return { downloadImage, isDownloading }
}
