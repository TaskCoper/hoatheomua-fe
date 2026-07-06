'use client'

import { useEffect, useRef, useState } from 'react'

interface HomeHeroVideoProps {
  videoSrc: string
  posterSrc?: string
}

interface NetworkInformation {
  effectiveType?: string
  saveData?: boolean
}

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g'])
const MOBILE_BREAKPOINT_PX = 768

function shouldSkipVideo() {
  if (typeof window === 'undefined') return true
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true
  if (window.innerWidth < MOBILE_BREAKPOINT_PX) return true

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (connection?.saveData) return true
  if (connection?.effectiveType && SLOW_CONNECTIONS.has(connection.effectiveType)) return true

  return false
}

export default function HomeHeroVideo({ videoSrc, posterSrc }: HomeHeroVideoProps) {
  const [shouldMount, setShouldMount] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldSkipVideo()) return

    let mounted = true
    const gestureEvents = ['pointerdown', 'scroll', 'keydown', 'touchstart'] as const

    const activate = () => {
      if (!mounted) return
      setShouldMount(true)
      detach()
    }

    const detach = () => {
      gestureEvents.forEach((evt) => window.removeEventListener(evt, activate, true))
    }

    gestureEvents.forEach((evt) => window.addEventListener(evt, activate, { capture: true, once: true, passive: true }))

    return () => {
      mounted = false
      detach()
    }
  }, [])

  return (
    <div ref={containerRef} className='pointer-events-none absolute inset-0 h-full w-full'>
      {shouldMount ? (
        <video
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload='auto'
          onPlaying={() => setIsPlaying(true)}
          onCanPlay={() => setIsPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}
    </div>
  )
}
