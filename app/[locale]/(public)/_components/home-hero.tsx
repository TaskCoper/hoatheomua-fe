import heroPoster from '@/public/images/hero-poster.jpg'
import Image from 'next/image'
import HomeHeroVideo from './home-hero-video'

interface HomeHeroProps {
  videoSrc?: string | null
}

export default function HomeHero({ videoSrc }: HomeHeroProps) {
  return (
    <div aria-hidden='true' className='relative isolate aspect-[64/27] w-full overflow-hidden bg-background'>
      <Image
        src={heroPoster}
        alt=''
        priority
        fetchPriority='high'
        fill
        sizes='100vw'
        quality={65}
        placeholder='blur'
        className='object-cover'
      />

      {videoSrc ? <HomeHeroVideo videoSrc={videoSrc} posterSrc={heroPoster.src} /> : null}

      <div className='pointer-events-none absolute inset-0 z-[1] bg-foreground/10' />
    </div>
  )
}
