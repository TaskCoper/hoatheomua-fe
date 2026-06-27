'use client'

import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { VolumeHighIcon, VolumeMute02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useEffect, useRef, useSyncExternalStore } from 'react'

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
const MUTED_STORAGE_KEY = 'floatingContact.musicMuted'
const MUTED_CHANGE_EVENT = 'floating-contact:muted-change'

const GESTURE_EVENTS = ['pointerdown', 'click', 'keydown', 'touchstart', 'touchend', 'wheel', 'scroll'] as const

function readMutedPref(): boolean {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function subscribeMutedPref(callback: () => void) {
  window.addEventListener(MUTED_CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(MUTED_CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function getServerMutedPref() {
  return false
}

function writeMutedPref(next: boolean) {
  try {
    localStorage.setItem(MUTED_STORAGE_KEY, next ? 'true' : 'false')
  } catch {
    // localStorage may be unavailable (private mode, etc.) — ignore.
  }
  window.dispatchEvent(new Event(MUTED_CHANGE_EVENT))
}

export default function FloatingContact() {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const isMuted = useSyncExternalStore(subscribeMutedPref, readMutedPref, getServerMutedPref)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.muted = true
      audio.pause()
      return
    }

    audio.muted = false
    audio.volume = 1

    let detachGesture: (() => void) | null = null

    const attachGesture = () => {
      if (detachGesture) return
      const activate = () => {
        audio.muted = false
        audio.volume = 1
        audio
          .play()
          .then(() => {
            if (!audio.muted) detachGesture?.()
          })
          .catch(() => undefined)
      }
      const targets: Array<Window | Document> = [window, document]
      targets.forEach((target) =>
        GESTURE_EVENTS.forEach((evt) => target.addEventListener(evt, activate, { capture: true, passive: true }))
      )
      detachGesture = () => {
        targets.forEach((target) => GESTURE_EVENTS.forEach((evt) => target.removeEventListener(evt, activate, true)))
        detachGesture = null
      }
    }

    audio
      .play()
      .then(() => {
        // Some browsers silently auto-mute when starting playback; if so, wait for a gesture.
        if (audio.muted) attachGesture()
      })
      .catch(() => {
        // Autoplay was blocked; play muted so the buffer is ready, then unlock on first gesture.
        audio.muted = true
        audio.play().catch(() => undefined)
        attachGesture()
      })

    return () => {
      detachGesture?.()
    }
  }, [isMuted])

  const toggleMusic = () => {
    writeMutedPref(!isMuted)
  }

  const musicLabel = t(isMuted ? 'floatingContact.musicOff' : 'floatingContact.musicOn')

  return (
    <div className='pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6'>
      <audio ref={audioRef} src={MUSIC_SRC} loop playsInline preload='auto' aria-hidden='true' />

      <button
        type='button'
        onClick={toggleMusic}
        aria-label={musicLabel}
        aria-pressed={!isMuted}
        title={musicLabel}
        className='pointer-events-auto group relative flex size-12 items-center justify-center rounded-full bg-card text-foreground shadow-lg ring-1 ring-foreground/10 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:size-14'
      >
        <HugeiconsIcon
          icon={isMuted ? VolumeMute02Icon : VolumeHighIcon}
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
