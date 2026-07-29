'use client'

import { cn } from '@/shared/utils'
import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css'
import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js'
import { useEffect, useRef } from 'react'

type MapInstance = InstanceType<typeof vietmapgl.Map>
type MarkerInstance = InstanceType<typeof vietmapgl.Marker>

// Fallback center when no coordinates are set yet: Ho Chi Minh City centre.
const DEFAULT_CENTER: [number, number] = [106.6297, 10.8231]
const DEFAULT_ZOOM = 15
const FALLBACK_ZOOM = 11

const VIETMAP_KEY = process.env.NEXT_PUBLIC_VIETMAP_API_KEY
const STYLE_URL = `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${VIETMAP_KEY}`

// maplibre aborts in-flight style/tile fetches when a map is torn down before
// it finishes loading (React StrictMode double-mount, or a fast dialog close).
// Those aborted fetches reject asynchronously with a benign AbortError that no
// one awaits, so it escapes as an unhandled rejection ("signal is aborted
// without reason") and trips the dev error overlay. Swallow just that case.
let abortRejectionSuppressorInstalled = false
const installAbortRejectionSuppressor = () => {
  if (abortRejectionSuppressorInstalled || typeof window === 'undefined') return
  abortRejectionSuppressorInstalled = true
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof DOMException && event.reason.name === 'AbortError') {
      event.preventDefault()
    }
  })
}

const isValidCoord = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  !(latitude === 0 && longitude === 0) &&
  Math.abs(latitude) <= 90 &&
  Math.abs(longitude) <= 180

interface AddressMapPickerProps {
  latitude: number
  longitude: number
  onPick: (coords: { latitude: number; longitude: number }) => void
  className?: string
}

export function AddressMapPicker({ latitude, longitude, onPick, className }: AddressMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const markerRef = useRef<MarkerInstance | null>(null)
  const markerAddedRef = useRef(false)
  const teardownTimerRef = useRef<number | null>(null)
  const onPickRef = useRef(onPick)
  // Tracks the coordinate this component last rendered, so external prop
  // updates recentre the map without echoing our own onPick emissions back.
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    if (!containerRef.current) return
    installAbortRejectionSuppressor()

    // React StrictMode (dev) mounts → unmounts → remounts synchronously. Cancel
    // any teardown queued by that fake unmount so we keep the same map instead of
    // destroying it mid-load (which is what aborts the in-flight style fetch).
    if (teardownTimerRef.current !== null) {
      clearTimeout(teardownTimerRef.current)
      teardownTimerRef.current = null
    }

    if (!mapRef.current) {
      const hasCoord = isValidCoord(latitude, longitude)
      const center: [number, number] = hasCoord ? [longitude, latitude] : DEFAULT_CENTER

      const map = new vietmapgl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center,
        zoom: hasCoord ? DEFAULT_ZOOM : FALLBACK_ZOOM
      })
      mapRef.current = map

      map.addControl(new vietmapgl.NavigationControl(), 'top-right')

      const marker = new vietmapgl.Marker({ draggable: true, color: '#e11d48' })
      markerRef.current = marker
      if (hasCoord) {
        marker.setLngLat(center).addTo(map)
        markerAddedRef.current = true
        lastCoordRef.current = { latitude, longitude }
      }

      const showMarkerAt = (lng: number, lat: number) => {
        marker.setLngLat([lng, lat])
        if (!markerAddedRef.current) {
          marker.addTo(map)
          markerAddedRef.current = true
        }
      }

      const emit = (lng: number, lat: number) => {
        lastCoordRef.current = { latitude: lat, longitude: lng }
        onPickRef.current({ latitude: lat, longitude: lng })
      }

      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat()
        emit(lng, lat)
      })

      map.on('click', (event) => {
        const { lng, lat } = event.lngLat
        showMarkerAt(lng, lat)
        emit(lng, lat)
      })
    }

    return () => {
      // Defer teardown one macrotask. StrictMode's remount above runs first and
      // cancels this, so the map is only really destroyed on a genuine unmount —
      // by which point its style has loaded and remove() aborts nothing.
      teardownTimerRef.current = window.setTimeout(() => {
        teardownTimerRef.current = null
        try {
          markerRef.current?.remove()
          mapRef.current?.remove()
        } catch {
          // Benign teardown races — safe to ignore.
        }
        mapRef.current = null
        markerRef.current = null
        markerAddedRef.current = false
        lastCoordRef.current = null
      }, 0)
    }
    // Map is created once; coordinate prop changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recentre when coordinates change from the outside (e.g. autocomplete resolve).
  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return
    if (!isValidCoord(latitude, longitude)) return

    const last = lastCoordRef.current
    if (last && last.latitude === latitude && last.longitude === longitude) return

    lastCoordRef.current = { latitude, longitude }
    marker.setLngLat([longitude, latitude])
    if (!markerAddedRef.current) {
      marker.addTo(map)
      markerAddedRef.current = true
    }
    map.easeTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), DEFAULT_ZOOM) })
  }, [latitude, longitude])

  return <div ref={containerRef} className={cn('h-56 w-full overflow-hidden rounded-xl', className)} />
}
