'use client'

import { useEffect } from 'react'

const KEYBOARD_MIN_PX = 150

export default function ViewportInsets() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const root = document.documentElement
    let frame = 0

    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        const inset = covered > KEYBOARD_MIN_PX ? covered : 0

        root.style.setProperty('--keyboard-inset', `${inset}px`)
        if (inset > 0) root.setAttribute('data-keyboard-open', '')
        else root.removeAttribute('data-keyboard-open')
      })
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)

    return () => {
      cancelAnimationFrame(frame)
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      root.style.removeProperty('--keyboard-inset')
      root.removeAttribute('data-keyboard-open')
    }
  }, [])

  return null
}
