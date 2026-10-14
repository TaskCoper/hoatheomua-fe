'use client'

import { MessengerIcon, ZaloIcon } from '@/features/layout/components/contact-channel-icons'
import { useLiveChat } from '@/features/layout/hooks/use-live-chat'
import { useGetPublicConfigs } from '@/hooks/use-get-public-configs'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import type { ContactConfigItem } from '@/types/config.type'
import { BotIcon, Cancel01Icon, Loading03Icon, VolumeHighIcon, VolumeMute02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

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

  const {
    isEnabled: isChatEnabled,
    isOpen: isChatOpen,
    isPending: isChatPending,
    hasUnread,
    toggle: toggleChat
  } = useLiveChat()

  const { configs: contactConfigs } = useGetPublicConfigs<ContactConfigItem>({ group: 'contact' })
  const zalo = contactConfigs.find((item) => item.key === 'contact.zalo')?.value.value
  const messenger = contactConfigs.find((item) => item.key === 'contact.messenger')?.value.value

  const contactChannels = [
    { key: 'zalo', href: zalo, Icon: ZaloIcon, labelKey: 'floatingContact.zalo' },
    { key: 'messenger', href: messenger, Icon: MessengerIcon, labelKey: 'floatingContact.messenger' }
  ] as const

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
  const chatLabel = t(isChatOpen ? 'floatingContact.chatClose' : 'floatingContact.chat')
  const chatIcon = isChatPending ? Loading03Icon : isChatOpen ? Cancel01Icon : BotIcon

  return (
    <>
      {isChatEnabled && isChatOpen ? (
        <button
          type='button'
          tabIndex={-1}
          aria-label={chatLabel}
          onClick={toggleChat}
          className='fixed inset-0 z-[9998] bg-black/30 supports-backdrop-filter:backdrop-blur-sm sm:hidden'
        />
      ) : null}

      <div
        className='below-modals pointer-events-none fixed right-4 bottom-[calc(1rem+var(--app-bottom-bar-height))] z-[10000] flex flex-col items-end gap-3 transition-[bottom] duration-200 sm:right-6 sm:bottom-[calc(1.5rem+var(--app-bottom-bar-height))]'
        style={{ paddingRight: 'env(safe-area-inset-right, 0px)' }}
      >
        <div
          className={cn(
            'flex flex-col items-end gap-3 transition-opacity duration-300',
            isChatOpen && 'max-sm:pointer-events-none max-sm:opacity-0'
          )}
        >
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

          {contactChannels.map(({ key, href, Icon, labelKey }) => {
            if (!href) return null
            const label = t(labelKey)
            return (
              <a
                key={key}
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={label}
                title={label}
                className='pointer-events-auto group relative flex size-12 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-foreground/10 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:size-14'
              >
                <Icon className='size-8 transition-transform duration-300 group-hover:scale-110 sm:size-10' />
              </a>
            )
          })}
        </div>

        {isChatEnabled ? (
          <div className='pointer-events-auto relative'>
            <span
              aria-hidden='true'
              style={{ '--spin-duration': '3.5s' } as React.CSSProperties}
              className='spin-loop pointer-events-none absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,transparent_0%,var(--color-primary)_20%,transparent_40%)] opacity-70'
            />

            <button
              type='button'
              onClick={toggleChat}
              aria-label={chatLabel}
              aria-expanded={isChatOpen}
              aria-busy={isChatPending}
              title={chatLabel}
              className='cursor-pointer group relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-foreground/10 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:size-14'
            >
              <HugeiconsIcon
                icon={chatIcon}
                className={cn(
                  'size-6 transition-transform duration-300 sm:size-7',
                  isChatPending ? 'animate-spin' : 'group-hover:scale-110'
                )}
              />

              {hasUnread && !isChatOpen ? (
                <span
                  aria-hidden='true'
                  className='dot-pulse absolute right-1 top-1 size-2.5 rounded-full bg-destructive ring-2 ring-card'
                />
              ) : null}
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}
