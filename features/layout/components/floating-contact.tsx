'use client'

import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { I18nKey } from '@/lib/i18n/types'
import { ContactConfigItem } from '@/types/config.type'
import { VolumeHighIcon, VolumeMute02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

const MUTED_STORAGE_KEY = 'floatingContact.musicMuted'
const MUTED_CHANGE_EVENT = 'floating-contact:muted-change'
const AUDIO_MOUNT_DELAY_MS = 4000

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
    // localStorage may be unavailable (private mode, etc.) - ignore.
  }
  window.dispatchEvent(new Event(MUTED_CHANGE_EVENT))
}

export default function FloatingContact({ musicSrc }: { musicSrc?: string | null }) {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const isMuted = useSyncExternalStore(subscribeMutedPref, readMutedPref, getServerMutedPref)
  const [audioMounted, setAudioMounted] = useState(false)

  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const zalo = contactConfigs.find((item) => item.key === 'contact.zalo')?.value.value
  const messenger = contactConfigs.find((item) => item.key === 'contact.messenger')?.value.value

  const CONTACT_CHANNELS = useMemo(
    () => [
      {
        key: 'zalo',
        href: zalo,
        src: 'https://hoatheomua.net/wp-content/uploads/2025/06/icon-web-4-1.webp',
        labelKey: 'floatingContact.zalo' as I18nKey
      },
      {
        key: 'messenger',
        href: messenger,
        src: 'https://hoatheomua.net/wp-content/uploads/2025/06/icon-web-1-1.webp',
        labelKey: 'floatingContact.messenger' as I18nKey
      }
    ],
    [zalo, messenger]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mount = () => setAudioMounted(true)

    const ric = (
      window as typeof window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }
    ).requestIdleCallback

    let timer: ReturnType<typeof setTimeout> | undefined
    let idleHandle: number | undefined

    if (ric) {
      timer = setTimeout(() => {
        idleHandle = ric(mount, { timeout: 1500 })
      }, AUDIO_MOUNT_DELAY_MS)
    } else {
      timer = setTimeout(mount, AUDIO_MOUNT_DELAY_MS)
    }

    const interactionEvents = ['pointerdown', 'keydown', 'touchstart'] as const
    const onEarlyInteraction = () => mount()
    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, onEarlyInteraction, { capture: true, once: true, passive: true })
    })

    return () => {
      if (timer) clearTimeout(timer)
      const cic = (window as typeof window & { cancelIdleCallback?: (handle: number) => void }).cancelIdleCallback
      if (idleHandle !== undefined && cic) cic(idleHandle)
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, onEarlyInteraction, true)
      })
    }
  }, [])

  useEffect(() => {
    if (!audioMounted) return
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
  }, [isMuted, audioMounted])

  const toggleMusic = () => {
    if (!audioMounted) setAudioMounted(true)
    writeMutedPref(!isMuted)
  }

  const musicLabel = t(isMuted ? 'floatingContact.musicOff' : 'floatingContact.musicOn')

  return (
    <div className='pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6'>
      {musicSrc ? (
        <>
          {audioMounted ? (
            <audio ref={audioRef} src={musicSrc} loop playsInline preload='none' aria-hidden='true' />
          ) : null}

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
        </>
      ) : null}

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
              width={40}
              height={40}
              sizes='(min-width: 640px) 40px, 32px'
              quality={70}
              aria-hidden='true'
              className='size-8 object-contain transition-transform duration-300 group-hover:scale-110 sm:size-10'
            />
          </a>
        )
      })}
    </div>
  )
}
