'use client'

import NavShell from './nav-shell'

interface HomeHeaderProps {
  videoSrc?: string | null
  posterSrc?: string
}

export default function HomeHeader({ videoSrc, posterSrc }: HomeHeaderProps) {
  return (
    <>
      <NavShell />

      <div
        aria-hidden='true'
        className='relative isolate aspect-[64/27] w-full overflow-hidden bg-background'
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload='metadata'
            className='pointer-events-none absolute inset-0 h-full w-full object-cover'
          />
        ) : posterSrc ? (
          <div
            className='pointer-events-none absolute inset-0 h-full w-full bg-cover bg-center'
            style={{ backgroundImage: `url(${posterSrc})` }}
          />
        ) : null}
        <div className='pointer-events-none absolute inset-0 z-0 bg-foreground/10' />
      </div>
    </>
  )
}
