'use client'

import NavShell from '@/features/layout/components/nav-shell'
import { useSelectedLayoutSegment } from 'next/navigation'

export default function PublicHeader() {
  const segment = useSelectedLayoutSegment()
  const isHome = segment === null

  return (
    <>
      <NavShell />
      {isHome ? null : <div aria-hidden='true' className='h-16 sm:h-[4.5rem] lg:h-20' />}
    </>
  )
}
