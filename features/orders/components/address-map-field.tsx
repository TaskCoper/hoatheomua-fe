'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/shared/utils'
import { Location01Icon, MapPinIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useReverseGeocode } from '../hooks/use-reverse-geocode'

const AddressMapPicker = dynamic(() => import('./address-map-picker').then((mod) => mod.AddressMapPicker), {
  ssr: false,
  loading: () => <Skeleton className='h-56 w-full rounded-xl' />
})

export interface ResolvedMapAddress {
  latitude: number
  longitude: number
  mapId: string
  addressLine: string
  ward: string
  city: string
  display: string
}

interface AddressMapFieldProps {
  latitude: number
  longitude: number
  onResolve: (result: ResolvedMapAddress) => void
  hint: string
  useLocationLabel: string
  resolvingLabel: string
  locationErrorLabel: string
  className?: string
  disabled?: boolean
}

export function AddressMapField({
  latitude,
  longitude,
  onResolve,
  hint,
  useLocationLabel,
  resolvingLabel,
  locationErrorLabel,
  className,
  disabled
}: AddressMapFieldProps) {
  const { reverseGeocode, isReverseGeocoding } = useReverseGeocode()
  const [isLocating, setIsLocating] = useState(false)

  const handlePick = useCallback(
    async ({ latitude: lat, longitude: lng }: { latitude: number; longitude: number }) => {
      try {
        const { result } = await reverseGeocode({ lat, lng })
        onResolve({
          latitude: lat,
          longitude: lng,
          mapId: result?.mapId ?? '',
          addressLine: result?.addressLine ?? '',
          ward: result?.ward ?? '',
          city: result?.city ?? '',
          display: result?.display ?? ''
        })
      } catch {
        // Keep the picked coordinates even if reverse geocoding fails.
        onResolve({ latitude: lat, longitude: lng, mapId: '', addressLine: '', ward: '', city: '', display: '' })
      }
    },
    [onResolve, reverseGeocode]
  )

  const handleUseLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error(locationErrorLabel)
      return
    }
    // Geolocation only resolves in a secure context: https:// or localhost.
    // Over plain http (e.g. a LAN IP dev server opened on a phone) the browser
    // blocks it outright, so surface that as the reason instead of a timeout.
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      toast.error(locationErrorLabel, { description: 'Requires HTTPS or localhost.' })
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        void handlePick({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      },
      (error) => {
        setIsLocating(false)
        // Report the actual cause so permission-denied vs. unavailable vs.
        // timeout is distinguishable (on macOS, "unavailable" usually means
        // Location Services is off for the browser in System Settings).
        console.warn('[geolocation] failed', { code: error.code, message: error.message })
        toast.error(locationErrorLabel, { description: error.message || undefined })
      },
      // Allow a recent cached fix and a longer window — high-accuracy on a
      // desktop can be slow, and a coarse position is fine as a starting pin.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }, [handlePick, locationErrorLabel])

  return (
    <div className={cn('space-y-2', className)}>
      <div className='flex items-center justify-between gap-2'>
        <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <HugeiconsIcon icon={MapPinIcon} strokeWidth={2} className='size-3.5 shrink-0' />
          {hint}
        </p>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-7 shrink-0 px-2 text-xs'
          onClick={handleUseLocation}
          disabled={disabled || isLocating}
        >
          {isLocating ? (
            <Spinner className='size-3.5' />
          ) : (
            <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className='size-3.5' />
          )}
          {useLocationLabel}
        </Button>
      </div>

      <div className='relative'>
        <AddressMapPicker latitude={latitude} longitude={longitude} onPick={handlePick} />
        {isReverseGeocoding ? (
          <div className='absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-background/85 py-1.5 text-xs text-muted-foreground backdrop-blur-sm'>
            <Spinner className='size-3.5' />
            {resolvingLabel}
          </div>
        ) : null}
      </div>
    </div>
  )
}
