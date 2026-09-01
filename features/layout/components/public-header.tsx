'use client'

import HeaderSpacer from '@/features/layout/components/header-spacer'
import NavShell from '@/features/layout/components/nav-shell'
import { useSelectedLayoutSegment } from 'next/navigation'

export default function PublicHeader() {
  const segment = useSelectedLayoutSegment()
  const isHome = segment === null

  return (
    <>
      <NavShell />
      {isHome ? null : <HeaderSpacer />}
    </>
  )
}
