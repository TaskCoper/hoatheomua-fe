'use client'

import dynamic from 'next/dynamic'

const FloatingContact = dynamic(() => import('@/features/layout/components/floating-contact'), { ssr: false })

export default function FloatingContactClient({ musicSrc }: { musicSrc?: string | null }) {
  return <FloatingContact musicSrc={musicSrc} />
}
