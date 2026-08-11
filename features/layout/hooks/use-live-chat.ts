'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const CHANNEL_ID = process.env.NEXT_PUBLIC_CLOUDGO_CHANNEL_ID
const SDK_SCRIPT_ID = 'cloudgo-livechat-sdk'
const OVERRIDE_STYLE_ID = 'cloudgo-livechat-overrides'

const IDLE_BOOT_DELAY_MS = 6000

/** How long a queued open waits for the SDK's websocket before giving up and opening anyway. */
const OPEN_TIMEOUT_MS = 12000
const OPEN_POLL_MS = 150

const API_ORIGIN = 'https://livechat.cloudgo.vn'

const HOST_ID = 'livechat-widget'
const CONTAINER = '.livechat-widget-container'
const LAUNCHER = '.livechat-widget-button'
const PANEL = '.livechat-widget-window'
const INFO = '.livechat-widget-info'
const UNREAD_CLASS = 'has-message'

const THEME_TOKENS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--border',
  '--input',
  '--ring',
  '--leaf',
  '--destructive',
  '--radius',
  '--font-sans',
  '--font-title'
] as const

const scoped = (selector: string, suffix = '') =>
  `#livechat-widget-inner ${selector}${suffix}, #${HOST_ID} ${selector}${suffix}`

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
  border-radius: calc(var(--radius) * 2.4) !important;
  box-shadow: 0 1.5rem 3.5rem rgb(31 47 47 / 22%) !important;
  /* The SDK ships \`transition: all\`, which also animates the discrete \`pointer-events\`
     and \`display\` it flips on open - a reliable way to end up visible but unclickable. */
  transition-property: opacity, transform !important;
}

${scoped(`${CONTAINER} ${PANEL}`, ':not([style*="display: none"])')} {
  pointer-events: auto !important;
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

/* ---------------------------------------------------------------------------
   Site theme. The palette itself rides in through the SDK's own \`primaryColor\`
   config (see \`fetchBrandedConfig\`); these rules cover the surfaces it hardcodes
   - slate greys, Inter, and 8/16px radii.
   --------------------------------------------------------------------------- */

${scoped(`${CONTAINER} ${PANEL}`)},
${scoped(`${CONTAINER} ${PANEL} *`)} {
  font-family: var(--font-sans) !important;
}

${scoped(`${CONTAINER} ${PANEL}`)} {
  background: var(--card) !important;
  color: var(--foreground) !important;
  border: 1px solid var(--border) !important;
}

${scoped(`${CONTAINER} .livechat-widget-header`)} {
  /* Also set here so the header still matches if the branded config fetch falls through. */
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  border-bottom-color: color-mix(in oklab, var(--primary-foreground) 16%, transparent) !important;
  padding: 0.75rem 1.25rem !important;
}

${scoped(`${CONTAINER} .livechat-widget-header .status`)} {
  color: color-mix(in oklab, var(--primary-foreground) 78%, transparent) !important;
}

${scoped(`${CONTAINER} .livechat-widget-header .status-dot`)} {
  background: var(--leaf) !important;
  box-shadow: 0 0 0 0.1875rem color-mix(in oklab, var(--leaf) 35%, transparent) !important;
}

${scoped(`${CONTAINER} .back-btn`, ':hover')},
${scoped(`${CONTAINER} .close-btn`, ':hover')} {
  background: color-mix(in oklab, var(--primary-foreground) 18%, transparent) !important;
}

${scoped(`${CONTAINER} .livechat-widget-messages`)} {
  background: var(--background) !important;
  scrollbar-width: thin !important;
  scrollbar-color: color-mix(in oklab, var(--muted-foreground) 40%, transparent) transparent !important;
}

${scoped(`${CONTAINER} .livechat-widget-messages`, '::-webkit-scrollbar')} {
  width: 0.375rem !important;
}

${scoped(`${CONTAINER} .livechat-widget-messages`, '::-webkit-scrollbar-thumb')} {
  background-color: color-mix(in oklab, var(--muted-foreground) 40%, transparent) !important;
  border-radius: 9999px !important;
}

${scoped(`${CONTAINER} .message-timestamp`)} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .livechat-widget-input`)} {
  background: var(--muted) !important;
  border-top: 1px solid var(--border) !important;
}

/* Their sheet forces \`.files-bar { display: flex !important }\`, which outranks the inline
   \`display: none\` the SDK sets when no files are attached - leaving an empty 8px strip
   above the composer. Collapse it while it holds no chips. */
${scoped(`${CONTAINER} .files-bar`, ':empty')} {
  display: none !important;
}

/* The wrapper already draws the divider - drop the row's own so they don't stack into 2px. */
${scoped(`${CONTAINER} .livechat-widget-input > div:not(.files-bar)`)} {
  background: var(--muted) !important;
  border-top: 0 !important;
}

${scoped(`${CONTAINER} .livechat-widget-input textarea`)} {
  color: var(--foreground) !important;
}

${scoped(`${CONTAINER} .livechat-widget-input textarea`, '::placeholder')} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .livechat-widget-footer`)} {
  display: none !important;
}

${scoped(`${CONTAINER} .suggestion-btn`)} {
  border-color: var(--input) !important;
  color: var(--secondary-foreground) !important;
  background: var(--secondary) !important;
  border-radius: 9999px !important;
}

/* Pre-chat form - \`collection_customer\` gates the conversation behind name + phone. */
${scoped(`${CONTAINER} .customer-form-popup`)} {
  background: color-mix(in oklab, var(--foreground) 45%, transparent) !important;
}

${scoped(`${CONTAINER} .customer-info-form-container`)} {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: calc(var(--radius) * 2.2) !important;
}

${scoped(`${CONTAINER} .customer-form-header h3`)} {
  font-family: var(--font-title, var(--font-sans)) !important;
  color: var(--primary) !important;
}

${scoped(`${CONTAINER} .customer-form-header p`)} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .customer-form-label`)} {
  color: var(--foreground) !important;
}

${scoped(`${CONTAINER} .required`)},
${scoped(`${CONTAINER} .error-message`)},
${scoped(`${CONTAINER} .text-danger`)} {
  color: var(--destructive) !important;
}

${scoped(`${CONTAINER} .customer-form-input`)},
${scoped(`${CONTAINER} .customer-form-field select`)} {
  background: var(--card) !important;
  color: var(--foreground) !important;
  border: 1px solid var(--input) !important;
  border-radius: calc(var(--radius) * 0.8) !important;
}

${scoped(`${CONTAINER} .customer-form-input`, '::placeholder')} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .customer-form-input`, ':focus')},
${scoped(`${CONTAINER} .customer-form-field select`, ':focus')} {
  border-color: var(--ring) !important;
  box-shadow: 0 0 0 0.1875rem color-mix(in oklab, var(--ring) 25%, transparent) !important;
}

${scoped(`${CONTAINER} .submit-btn`)},
${scoped(`${CONTAINER} .btn-create-new-session`)},
${scoped(`${CONTAINER} .confirm-end-conversation`)} {
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  border-radius: calc(var(--radius) * 0.8) !important;
}

${scoped(`${CONTAINER} .cancel-end-conversation`)} {
  background: var(--secondary) !important;
  color: var(--secondary-foreground) !important;
  border-radius: calc(var(--radius) * 0.8) !important;
}
`

type CloudGoConfig = Record<string, unknown>

/** The slice of the vendor's LiveChatSDK instance we read to tell whether it can be used. */
interface CloudGoInstance {
  isConnected?: boolean
  requiresCustomerInfo?: boolean
  customerInfoSubmitted?: boolean
}

interface CloudGoGlobal {
  init: (options: { channel_id: string; config?: CloudGoConfig }) => Promise<unknown>
}

declare global {
  interface Window {
    CloudGO?: CloudGoGlobal
  }
}

let bootPromise: Promise<void> | null = null
let instance: CloudGoInstance | null = null

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

function readThemeTokens(): Record<string, string> {
  const computed = getComputedStyle(document.documentElement)
  const tokens: Record<string, string> = {}

  THEME_TOKENS.forEach((name) => {
    const value = computed.getPropertyValue(name).trim()
    if (value) tokens[name] = value
  })

  return tokens
}

/**
 * The SDK derives the launcher, header, visitor bubbles, avatars and send button from a
 * single `primaryColor`, and it only accepts a 6-digit hex (it parses the channels by hand
 * to pick contrasting text). Anything else and we leave its own colour alone.
 */
function readBrandColor(tokens: Record<string, string>): string | null {
  const primary = tokens['--primary']
  return primary && /^#[0-9a-f]{6}$/i.test(primary) ? primary : null
}

function applyThemeTokens(host: HTMLElement, tokens: Record<string, string>) {
  Object.entries(tokens).forEach(([name, value]) => host.style.setProperty(name, value))

  // The SDK's own stylesheet reads `--primary-color` and a set of hex-alpha variants off
  // `:root` - which never matches inside a shadow root, so they'd otherwise be unset.
  const brand = readBrandColor(tokens)
  if (!brand) return

  host.style.setProperty('--primary-color', brand)
  host.style.setProperty('--primary-color-safe-hover', brand)
  ;['15', '20', '40', '50', '80', 'bb', 'dd'].forEach((alpha) =>
    host.style.setProperty(`--primary-color-${alpha}`, `${brand}${alpha}`)
  )

  const onBrand = tokens['--primary-foreground']
  if (onBrand) host.style.setProperty('--suggestion-btn-hover-text-color', onBrand)
}

/**
 * `CloudGO.init` skips its own config fetch when handed a `config`, so we fetch the same
 * payload and swap the brand colour in. Everything else stays server-managed - change the
 * greeting or the pre-chat fields in the CloudGO dashboard and they still come through.
 */
async function fetchBrandedConfig(channelId: string, primaryColor: string): Promise<CloudGoConfig | null> {
  try {
    const response = await fetch(`${API_ORIGIN}/api/v1/channels/${channelId}/config`)
    if (!response.ok) return null

    const payload: unknown = await response.json()
    const config = (payload as { data?: { config?: CloudGoConfig } })?.data?.config
    if (!config || typeof config !== 'object') return null

    return { ...config, primaryColor }
  } catch {
    return null
  }
}

function bootLiveChat(channelId: string, primaryColor: string | null): Promise<void> {
  bootPromise ??= loadSdk(channelId).then(async () => {
    const config = primaryColor ? await fetchBrandedConfig(channelId, primaryColor) : null
    // A null config means the fetch failed - fall back to the SDK fetching it itself.
    const created = await window.CloudGO?.init(config ? { channel_id: channelId, config } : { channel_id: channelId })
    instance = (created ?? null) as CloudGoInstance | null
  })
  return bootPromise
}

/**
 * `createWidget()` runs synchronously, but `connectWebSocket()` and `loadMessageHistory()`
 * finish well after it - so the panel can be on screen with no live session behind it, which
 * reads to the user as "it opened but nothing works". Wait for a session before opening.
 */
function isWidgetUsable() {
  if (!instance) return false
  // The pre-chat form gates the socket, so a widget waiting on it is already usable.
  if (instance.requiresCustomerInfo && !instance.customerInfoSubmitted) return true
  return Boolean(instance.isConnected)
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
  const openTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearOpenTimer = useCallback(() => {
    if (!openTimerRef.current) return
    clearInterval(openTimerRef.current)
    openTimerRef.current = null
  }, [])

  /** Hold the click until the session is live, then open. Opens anyway once patience runs out. */
  const openWhenUsable = useCallback(
    (launcher: HTMLElement) => {
      clearOpenTimer()
      const startedAt = performance.now()

      const attempt = () => {
        if (!wantsOpenRef.current) {
          clearOpenTimer()
          return
        }
        if (!isWidgetUsable() && performance.now() - startedAt < OPEN_TIMEOUT_MS) return

        clearOpenTimer()
        wantsOpenRef.current = false
        setIsPending(false)
        launcher.click()
      }

      attempt()
      if (wantsOpenRef.current) openTimerRef.current = setInterval(attempt, OPEN_POLL_MS)
    },
    [clearOpenTimer]
  )

  useEffect(() => clearOpenTimer, [clearOpenTimer])

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

      applyThemeTokens(host, readThemeTokens())

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

        if (launcher && wantsOpenRef.current) openWhenUsable(launcher)
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

    const themeTokens = readThemeTokens()
    bootLiveChat(CHANNEL_ID, readBrandColor(themeTokens)).catch(() => {
      // Nothing to recover from here - drop the spinner and leave the Zalo / Messenger
      // links above the bubble as the working fallback.
      if (!disposed) setIsPending(false)
    })

    return () => {
      disposed = true
      teardown.forEach((fn) => fn())
      clearOpenTimer()
      launcherRef.current = null
    }
  }, [shouldBoot, clearOpenTimer, openWhenUsable])

  const toggle = useCallback(() => {
    if (!CHANNEL_ID) return

    const launcher = launcherRef.current

    // Closing is always safe; only opening has to wait for a live session.
    if (launcher && (isOpen || isWidgetUsable())) {
      clearOpenTimer()
      wantsOpenRef.current = false
      setIsPending(false)
      launcher.click()
      return
    }

    wantsOpenRef.current = true
    setIsPending(true)
    setShouldBoot(true)
    if (launcher) openWhenUsable(launcher)
  }, [isOpen, clearOpenTimer, openWhenUsable])

  return { isEnabled: Boolean(CHANNEL_ID), isOpen, isPending, hasUnread, toggle }
}
