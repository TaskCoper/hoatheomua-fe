'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyMapEmbedProps {
  src: string
  title: string
  className?: string
}

export default function LazyMapEmbed({ src, title, className }: LazyMapEmbedProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <iframe
          src={src}
          title={title}
          className='h-full w-full'
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          allow='geolocation'
        />
      ) : (
        <button
          type='button'
          onClick={() => setShouldLoad(true)}
          className='flex h-full w-full items-center justify-center bg-secondary/40 text-xs text-primary'
          aria-label={title}
        >
          {title}
        </button>
      )}
    </div>
  )
}
