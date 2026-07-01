'use client'

import { useSelectedLayoutSegment } from 'next/navigation'
import Header from './header'
import HomeHeader from './home-header'

export default function PublicHeader() {
  const segment = useSelectedLayoutSegment()

  if (segment === null) {
    return <HomeHeader />
  }

  return <Header />
}
