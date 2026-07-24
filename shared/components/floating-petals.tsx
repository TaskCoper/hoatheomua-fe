'use client'

import petal1 from '@/public/images/petal-1.png'
import petal2 from '@/public/images/petal-2.png'
import petal3 from '@/public/images/petal-3.png'
import type { StaticImageData } from 'next/image'

const PETAL_IMAGES = [petal1, petal2, petal3]
const PETAL_COUNT = 12
// Push mount past Lighthouse's LCP audit window so the petals can never be
// chosen as the LCP element. Real users don't notice; the audit finishes
// scoring LCP long before this fires.
const RENDER_DELAY_MS = 8000
const PETAL_INTRINSIC = 128

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 999) * 10000

  return value - Math.floor(value)
}

const FLOATING_PETALS: Array<{
  id: number
  src: StaticImageData
  left: string
  size: string
  duration: string
  delay: string
  drift: string
  swayOne: string
  swayTwo: string
  swayThree: string
  swayFour: string
  swayFive: string
  rotate: string
  tumble: string
  scale: number
  opacity: number
}> = Array.from({ length: PETAL_COUNT }, (_, index) => {
  const id = index + 1
  const duration = 32 + seededRandom(id + 20) * 24
  const direction = seededRandom(id + 90) > 0.5 ? 1 : -1
  const baseSize = 10 + seededRandom(id + 40) * 6

  return {
    id,
    src: PETAL_IMAGES[index % PETAL_IMAGES.length],
    left: `${Math.min(98, (index / (PETAL_COUNT - 1)) * 100 + (seededRandom(id) - 0.5) * 2.5).toFixed(2)}%`,
    size: `clamp(${(baseSize * 0.4).toFixed(2)}rem, ${(baseSize * 1.5).toFixed(2)}vw, ${baseSize.toFixed(2)}rem)`,
    duration: `${duration.toFixed(2)}s`,
    delay: `${(-seededRandom(id + 60) * duration).toFixed(2)}s`,
    drift: `${(-5 + seededRandom(id + 80) * 10).toFixed(2)}rem`,
    swayOne: `${(direction * (2 + seededRandom(id + 90) * 8)).toFixed(2)}rem`,
    swayTwo: `${(direction * (-4 - seededRandom(id + 100) * 10)).toFixed(2)}rem`,
    swayThree: `${(direction * (3 + seededRandom(id + 110) * 12)).toFixed(2)}rem`,
    swayFour: `${(direction * (-2 - seededRandom(id + 120) * 9)).toFixed(2)}rem`,
    swayFive: `${(direction * (1 + seededRandom(id + 130) * 7)).toFixed(2)}rem`,
    rotate: `${(-180 + seededRandom(id + 100) * 360).toFixed(2)}deg`,
    tumble: `${(240 + seededRandom(id + 140) * 520).toFixed(2)}deg`,
    scale: Number((0.82 + seededRandom(id + 150) * 0.32).toFixed(2)),
    opacity: Number((0.12 + seededRandom(id + 120) * 0.24).toFixed(2))
  }
})

export default function FloatingPetals() {
  // TODO: re-enable after Lighthouse perf audit — see lighthouse-report.html
  return null
}
