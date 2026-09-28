import heroPoster from '@/public/images/hero-poster.svg'
import Image from 'next/image'
import HomeHeroVideo from './home-hero-video'

interface HomeHeroProps {
  videoSrc?: string | null
}

export default function HomeHero({ videoSrc }: HomeHeroProps) {
  return (
    <div className='relative isolate aspect-3/2 w-full overflow-hidden bg-background sm:aspect-2/1 lg:aspect-[64/27]'>
      <Image src={heroPoster} alt='Hoa Theo Mùa' priority fill sizes='100vw' unoptimized className='object-cover' />

      {videoSrc ? <HomeHeroVideo videoSrc={videoSrc} /> : null}

      <div aria-hidden='true' className='pointer-events-none absolute inset-0 z-[1] bg-foreground/10' />
    </div>
  )
}
