'use client'

import NavBar from '@/features/layout/components/nav-bar'
import { useEffect, useState } from 'react'

export default function NavShell() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-200',
        isScrolled ? 'border-secondary/40 bg-secondary/30 backdrop-blur-md' : 'border-transparent bg-transparent'
      ].join(' ')}
    >
      <div className='mx-auto w-full max-w-7xl px-4 py-3'>
        <NavBar />
      </div>
    </header>
  )
}
