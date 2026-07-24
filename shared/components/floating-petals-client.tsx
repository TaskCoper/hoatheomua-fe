'use client'

import dynamic from 'next/dynamic'

const FloatingPetals = dynamic(() => import('@/shared/components/floating-petals'), { ssr: false })

export default function FloatingPetalsClient() {
  return <FloatingPetals />
}
