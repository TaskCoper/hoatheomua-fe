interface HomeHeroProps {
  videoSrc?: string | null
}

export default function HomeHero({ videoSrc }: HomeHeroProps) {
  return (
    <div
      aria-hidden='true'
      className='relative isolate aspect-[64/27] w-full overflow-hidden bg-gradient-to-br from-secondary/60 via-background to-primary/10'
    >
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload='auto'
          disableRemotePlayback
          className='pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden'
        />
      ) : null}

      <div className='pointer-events-none absolute inset-0 z-[1] bg-foreground/10' />
    </div>
  )
}
