'use client'

import petal1 from '@/public/images/petal-1.png'
import petal2 from '@/public/images/petal-2.png'
import petal3 from '@/public/images/petal-3.png'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const petals = [petal1, petal2, petal3]

interface Petal {
  id: number
  left: number
  delay: number
  duration: number
  image: typeof petal1
  size: number
  opacity: number
}

export function FallingPetals() {
  const [petalsData, setPetalsData] = useState<Petal[]>([])

  useEffect(() => {
    const generatePetals = () => {
      const newPetals: Petal[] = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
        image: petals[Math.floor(Math.random() * petals.length)],
        size: 50 + Math.random() * 60,
        opacity: 0.12 + Math.random() * 0.2
      }))
      setPetalsData(newPetals)
    }

    generatePetals()
    const interval = setInterval(generatePetals, 30000) // Regenerate every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style>{`
        @keyframes fallPetal {
          0% {
            top: -50px;
            opacity: 0;
            transform: translateX(0) rotate(0deg);
          }
          10% {
            opacity: var(--opacity);
          }
          90% {
            opacity: var(--opacity);
          }
          100% {
            top: 100vh;
            opacity: 0;
            transform: translateX(100px) rotate(360deg);
          }
        }

        .falling-petal {
          position: fixed;
          top: -50px;
          pointer-events: none;
          z-index: 10;
          animation: fallPetal linear infinite;
        }
      `}</style>
      {petalsData.map((petal) => (
        <div
          key={petal.id}
          className='falling-petal'
          style={
            {
              left: `${petal.left}%`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              '--opacity': petal.opacity
            } as React.CSSProperties & { '--opacity': number }
          }
        >
          <Image
            src={petal.image}
            alt='Falling petal'
            width={petal.size}
            height={petal.size}
            className='w-full h-full object-contain'
            draggable={false}
          />
        </div>
      ))}
    </>
  )
}
