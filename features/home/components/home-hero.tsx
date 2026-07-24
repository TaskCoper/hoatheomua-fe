import heroPoster from '@/public/images/hero-poster.svg'
import Image from 'next/image'
import HomeHeroVideo from '@/features/home/components/home-hero-video'

interface HomeHeroProps {
  videoSrc?: string | null
}

// Small vector SVG file (~430 bytes) with a brand gradient. Rendered via
// next/image `priority` so it emits a `<link rel="preload">` and is picked as
// the LCP element in the first paint frame — no separate JPG poster needed
// and no per-user network bytes for a raster asset.
export default function HomeHero({ videoSrc }: HomeHeroProps) {
  return (
    <div className='relative isolate aspect-[64/27] w-full overflow-hidden bg-background'>
      <Image src={heroPoster} alt='Hoa Theo Mùa' priority fill sizes='100vw' unoptimized className='object-cover' />

      {videoSrc ? <HomeHeroVideo videoSrc={videoSrc} /> : null}

      <div aria-hidden='true' className='pointer-events-none absolute inset-0 z-[1] bg-foreground/10' />
    </div>
  )
}
