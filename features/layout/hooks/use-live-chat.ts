'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const CHANNEL_ID = process.env.NEXT_PUBLIC_CLOUDGO_CHANNEL_ID
const SDK_SCRIPT_ID = 'cloudgo-livechat-sdk'
const OVERRIDE_STYLE_ID = 'cloudgo-livechat-overrides'

const IDLE_BOOT_DELAY_MS = 6000

const HOST_ID = 'livechat-widget'
const CONTAINER = '.livechat-widget-container'
const LAUNCHER = '.livechat-widget-button'
const PANEL = '.livechat-widget-window'
const INFO = '.livechat-widget-info'
const UNREAD_CLASS = 'has-message'

const scoped = (selector: string) => `#livechat-widget-inner ${selector}, #${HOST_ID} ${selector}`

const OVERRIDE_CSS = `
${scoped(`${CONTAINER} ${LAUNCHER}`)},
${scoped(`${CONTAINER} ${INFO}`)} {
  display: none !important;
}

${scoped(`${CONTAINER} ${PANEL}`)} {
  /* The panel ships as \`position: absolute\` inside a shrink-to-fit container, so a
     left/right pair would resolve against a zero-width box. Pin it to the viewport. */
  position: fixed !important;
  top: auto !important;
  left: auto !important;
  right: 6rem !important;
  bottom: 1.5rem !important;
  width: min(25rem, calc(100vw - 7.5rem)) !important;
  height: min(37.5rem, calc(100vh - 3rem)) !important;
  height: min(37.5rem, calc(100dvh - 3rem)) !important;
  max-height: none !important;
  border-radius: 1.25rem !important;
  box-shadow: 0 1.5rem 3.5rem rgb(31 47 47 / 22%) !important;
}

@media (max-width: 639px) {
  ${scoped(`${CONTAINER} ${PANEL}`)} {
    left: 0.75rem !important;
    right: 0.75rem !important;
    bottom: 5rem !important;
    width: auto !important;
    height: min(32rem, calc(100vh - 7rem)) !important;
    height: min(32rem, calc(100dvh - 7rem)) !important;
  }
}
`

interface CloudGoGlobal {
  init: (options: { channel_id: string }) => Promise<unknown>
}

declare global {
  interface Window {
    CloudGO?: CloudGoGlobal
  }
}

let bootPromise: Promise<void> | null = null

function loadSdk(channelId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.CloudGO) {
      resolve()
      return
    }

    const existing = document.getElementById(SDK_SCRIPT_ID) as HTMLScriptElement | null
    const script = existing ?? document.createElement('script')

    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('CloudGO livechat SDK failed to load')), { once: true })

    if (!existing) {
      script.id = SDK_SCRIPT_ID
      script.src = `https://livechat.cloudgo.vn/api/v1/channels/${channelId}/sdk.js`
      script.async = true
      document.head.appendChild(script)
    }
  })
}

function bootLiveChat(channelId: string): Promise<void> {
  bootPromise ??= loadSdk(channelId).then(async () => {
    await window.CloudGO?.init({ channel_id: channelId })
  })
  return bootPromise
}

function getWidgetRoot(host: HTMLElement): ShadowRoot | HTMLElement {
  return host.shadowRoot ?? host
}

function ensureOverrideStyles(root: ShadowRoot | HTMLElement) {
  // Shadow roots need their own copy; the fallback tree lives in the main document.
  const target: ShadowRoot | HTMLHeadElement = root instanceof ShadowRoot ? root : document.head
  if (target.querySelector(`#${OVERRIDE_STYLE_ID}`)) return

  const style = document.createElement('style')
  style.id = OVERRIDE_STYLE_ID
  style.textContent = OVERRIDE_CSS
  target.appendChild(style)
}

function readPanelOpen(panel: HTMLElement) {
  return panel.style.display !== 'none' && panel.style.opacity !== '0'
}

/** Resolves as soon as the SDK has appended its host element to the body. */
function observeWidgetHost(onHost: (host: HTMLElement) => void) {
  const existing = document.getElementById(HOST_ID)
  if (existing) {
    onHost(existing)
    return () => undefined
  }

  const observer = new MutationObserver(() => {
    const host = document.getElementById(HOST_ID)
    if (!host) return
    observer.disconnect()
    onHost(host)
  })
  observer.observe(document.body, { childList: true })

  return () => observer.disconnect()
}

export interface LiveChat {
  /** `NEXT_PUBLIC_CLOUDGO_CHANNEL_ID` is set - render nothing when it isn't. */
  isEnabled: boolean
  /** The vendor panel is on screen. */
  isOpen: boolean
  /** The bubble was tapped before the SDK finished booting. */
  isPending: boolean
  /** An agent or bot replied while the panel was closed. */
  hasUnread: boolean
  toggle: () => void
}

export function useLiveChat(): LiveChat {
  const [shouldBoot, setShouldBoot] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const launcherRef = useRef<HTMLElement | null>(null)
  const wantsOpenRef = useRef(false)

  // Boot once the page is idle so the SDK never competes with the initial render.
  useEffect(() => {
    if (!CHANNEL_ID) return

    const boot = () => setShouldBoot(true)

    const ric = (
      window as typeof window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }
    ).requestIdleCallback

    let idleHandle: number | undefined
    const timer = setTimeout(() => {
      if (ric) idleHandle = ric(boot, { timeout: 2000 })
      else boot()
    }, IDLE_BOOT_DELAY_MS)

    return () => {
      clearTimeout(timer)
      const cic = (window as typeof window & { cancelIdleCallback?: (handle: number) => void }).cancelIdleCallback
      if (idleHandle !== undefined && cic) cic(idleHandle)
    }
  }, [])

  useEffect(() => {
    if (!shouldBoot || !CHANNEL_ID) return

    let disposed = false
    const teardown: Array<() => void> = []

    const attach = (host: HTMLElement) => {
      if (disposed) return

      const root = getWidgetRoot(host)
      ensureOverrideStyles(root)

      const container = root.querySelector(CONTAINER)
      if (!container) return

      let panelObserver: MutationObserver | null = null
      let launcherObserver: MutationObserver | null = null

      const bind = () => {
        const launcher = container.querySelector<HTMLElement>(LAUNCHER)
        const panel = container.querySelector<HTMLElement>(PANEL)

        // The SDK re-shows its info bubble with an inline `!important`, which CSS can't beat.
        container.querySelectorAll(INFO).forEach((node) => node.remove())
        launcher?.style.setProperty('display', 'none', 'important')

        if (launcher && launcher !== launcherRef.current) {
          launcherRef.current = launcher
          launcherObserver?.disconnect()
          launcherObserver = new MutationObserver(() => setHasUnread(launcher.classList.contains(UNREAD_CLASS)))
          launcherObserver.observe(launcher, { attributes: true, attributeFilter: ['class'] })
        }

        if (panel) {
          panelObserver?.disconnect()
          panelObserver = new MutationObserver(() => setIsOpen(readPanelOpen(panel)))
          panelObserver.observe(panel, { attributes: true, attributeFilter: ['style'] })
          setIsOpen(readPanelOpen(panel))
        }

        if (launcher && wantsOpenRef.current) {
          wantsOpenRef.current = false
          setIsPending(false)
          launcher.click()
        }
      }

      bind()

      // `createWidget()` runs again after "end conversation", replacing these nodes.
      const containerObserver = new MutationObserver(bind)
      containerObserver.observe(container, { childList: true })

      teardown.push(() => {
        containerObserver.disconnect()
        panelObserver?.disconnect()
        launcherObserver?.disconnect()
      })
    }

    const stopHostObserver = observeWidgetHost(attach)
    teardown.push(stopHostObserver)

    bootLiveChat(CHANNEL_ID).catch(() => {
      // Nothing to recover from here - drop the spinner and leave the Zalo / Messenger
      // links above the bubble as the working fallback.
      if (!disposed) setIsPending(false)
    })

    return () => {
      disposed = true
      teardown.forEach((fn) => fn())
      launcherRef.current = null
    }
  }, [shouldBoot])

  const toggle = useCallback(() => {
    if (!CHANNEL_ID) return

    const launcher = launcherRef.current
    if (launcher) {
      launcher.click()
      return
    }

    wantsOpenRef.current = true
    setIsPending(true)
    setShouldBoot(true)
  }, [])

  return { isEnabled: Boolean(CHANNEL_ID), isOpen, isPending, hasUnread, toggle }
}
