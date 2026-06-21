'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { VolumeHighIcon, VolumeMute02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const CONTACT_CHANNELS = [
  {
    key: 'zalo',
    href: 'https://zalo.me/hoatheomua',
    src: 'https://hoatheomua.net/wp-content/uploads/2025/06/icon-web-4-1.webp',
    labelKey: 'floatingContact.zalo'
  },
  {
    key: 'messenger',
    href: 'https://www.facebook.com/messages/t/Hoatheomua.tana',
    src: 'https://hoatheomua.net/wp-content/uploads/2025/06/icon-web-1-1.webp',
    labelKey: 'floatingContact.messenger'
  }
] as const

const MUSIC_SRC = '/music/bg-music.mp3'
const MUSIC_PREF_KEY = 'bgMusicEnabled'

export default function FloatingContact() {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const wantsOff = typeof window !== 'undefined' && window.localStorage.getItem(MUSIC_PREF_KEY) === 'false'
    if (wantsOff) return

    const tryPlayWithSound = () => {
      audio.muted = false
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => undefined)
    }

    audio.play().catch(() => undefined)

    const onInteract = () => {
      tryPlayWithSound()
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
      window.removeEventListener('touchstart', onInteract)
    }
    window.addEventListener('pointerdown', onInteract, { once: true })
    window.addEventListener('keydown', onInteract, { once: true })
    window.addEventListener('touchstart', onInteract, { once: true })

    return () => {
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
      window.removeEventListener('touchstart', onInteract)
    }
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      window.localStorage.setItem(MUSIC_PREF_KEY, 'false')
    } else {
      audio.muted = false
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          window.localStorage.setItem(MUSIC_PREF_KEY, 'true')
        })
        .catch(() => undefined)
    }
  }

  const musicLabel = t(isPlaying ? 'floatingContact.musicOn' : 'floatingContact.musicOff')

  return (
    <div className='pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6'>
      <audio ref={audioRef} src={MUSIC_SRC} loop muted autoPlay playsInline preload='auto' aria-hidden='true' />

      <button
        type='button'
        onClick={toggleMusic}
        aria-label={musicLabel}
        aria-pressed={isPlaying}
        title={musicLabel}
        className='pointer-events-auto group relative flex size-12 items-center justify-center rounded-full bg-card text-foreground shadow-lg ring-1 ring-foreground/10 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:size-14'
      >
        <HugeiconsIcon
          icon={isPlaying ? VolumeHighIcon : VolumeMute02Icon}
          className='size-6 transition-transform duration-300 group-hover:scale-110 sm:size-7'
        />
      </button>

      {CONTACT_CHANNELS.map((channel) => {
        const label = t(channel.labelKey)
        return (
          <a
            key={channel.key}
            href={channel.href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={label}
            title={label}
            className='pointer-events-auto group relative flex size-12 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-foreground/10 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:size-14'
          >
            <Image
              src={channel.src}
              alt=''
              width={56}
              height={56}
              aria-hidden='true'
              className='size-8 object-contain transition-transform duration-300 group-hover:scale-110 sm:size-10'
            />
          </a>
        )
      })}
    </div>
  )
}
