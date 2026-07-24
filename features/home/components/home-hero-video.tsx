'use client'

import { useState, useSyncExternalStore } from 'react'

interface HomeHeroVideoProps {
  videoSrc: string
}

interface NetworkInformation {
  effectiveType?: string
  saveData?: boolean
}

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g'])

function shouldSkipVideo() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (connection?.saveData) return true
  if (connection?.effectiveType && SLOW_CONNECTIONS.has(connection.effectiveType)) return true
  return false
}

const noop = () => () => {}

export default function HomeHeroVideo({ videoSrc }: HomeHeroVideoProps) {
  const ready = useSyncExternalStore(
    noop,
    () => !shouldSkipVideo(),
    () => false
  )
  const [playing, setPlaying] = useState(false)

  if (!ready) return null

  return (
    <video
      src={videoSrc}
      autoPlay
      muted
      loop
      playsInline
      preload='auto'
      disableRemotePlayback
      onPlaying={() => setPlaying(true)}
      onCanPlay={() => setPlaying(true)}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
        playing ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
