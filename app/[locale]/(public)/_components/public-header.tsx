'use client'

import { useSelectedLayoutSegment } from 'next/navigation'
import Header from './header'
import HomeHeader from './home-header'

interface PublicHeaderProps {
  homeVideoSrc?: string | null
  homePosterSrc?: string
}

export default function PublicHeader({ homeVideoSrc, homePosterSrc }: PublicHeaderProps) {
  const segment = useSelectedLayoutSegment()

  if (segment === null) {
    return <HomeHeader videoSrc={homeVideoSrc} posterSrc={homePosterSrc} />
  }

  return <Header />
}
