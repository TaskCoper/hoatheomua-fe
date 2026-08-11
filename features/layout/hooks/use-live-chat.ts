'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const CHANNEL_ID = process.env.NEXT_PUBLIC_CLOUDGO_CHANNEL_ID
const SDK_SCRIPT_ID = 'cloudgo-livechat-sdk'
const OVERRIDE_STYLE_ID = 'cloudgo-livechat-overrides'

const IDLE_BOOT_DELAY_MS = 6000

const OPEN_TIMEOUT_MS = 12000
const OPEN_POLL_MS = 150

const ATTACH_TIMEOUT_MS = 15000
const ATTACH_POLL_MS = 100

const API_ORIGIN = 'https://livechat.cloudgo.vn'

const HOST_ID = 'livechat-widget'
const CONTAINER = '.livechat-widget-container'
const LAUNCHER = '.livechat-widget-button'
const PANEL = '.livechat-widget-window'
const INFO = '.livechat-widget-info'
const TEXTAREA = '.livechat-widget-input textarea'
const UNREAD_CLASS = 'has-message'

const MESSAGE_MAX_LENGTH = 2000

const TEXTAREA_MIN_HEIGHT_PX = 40
const TEXTAREA_MAX_HEIGHT_PX = 320

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

/** An agent row's avatar; a visitor row has no such column - see the bubble rules. */
const AVATAR = '.message-container > div:first-child:not(:only-child)'

/** The typing indicator's own avatar column - its own subtree, so the AVATAR rules miss it. */
const TYPING_AVATAR = '.typing-indicator > div > div:first-child'

/**
 * Hugeicons' `FlowerIcon` as an alpha mask. It stands in for the emoji the CloudGO dashboard
 * hands out per agent - one mark for all of them, since the emoji arrives as a bare text node
 * that no selector can tell apart. A blossom carries the shop rather than the vendor's tooling,
 * so it reads as "someone from the florist" whether the row came from a bot or a person.
 */
const AVATAR_MARK =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M14.4999%2012.5C14.4999%2013.8807%2013.3807%2015%2011.9999%2015C10.6192%2015%209.49994%2013.8807%209.49994%2012.5C9.49994%2011.1193%2010.6192%2010%2011.9999%2010C13.3807%2010%2014.4999%2011.1193%2014.4999%2012.5Z%22%2F%3E%3Cpath%20d%3D%22M11.9999%203C14.2091%203%2015.998%204.91739%2015.998%207.12653C16.3182%207.04393%2016.6539%207%2016.9999%207C19.2091%207%2020.9999%208.79086%2020.9999%2011C20.9999%2012.5964%2020.0647%2013.9745%2018.7122%2014.616C19.2071%2015.2818%2019.4999%2016.1067%2019.4999%2017C19.4999%2019.2091%2017.7091%2021%2015.4999%2021C13.9939%2021%2012.6823%2020.1677%2011.9999%2018.938C11.3176%2020.1677%2010.006%2021%208.49994%2021C6.2908%2021%204.49994%2019.2091%204.49994%2017C4.49994%2016.1067%204.79277%2015.2818%205.28767%2014.616C3.93518%2013.9745%202.99994%2012.5964%202.99994%2011C2.99994%208.79086%204.7908%207%206.99994%207C7.34595%207%207.68169%207.04393%208.0019%207.12652C8.0019%204.91738%209.7908%203%2011.9999%203Z%22%2F%3E%3C%2Fsvg%3E'

const OVERRIDE_CSS = `
/* The site draws every surface as \`ring-1 ring-foreground/5\` over a shadow tinted with the
   light-mode \`--primary\` hardcoded - see the product and article cards - never a \`border\`
   and never a neutral grey. Both ride on the container so every rule below inherits them. */
${scoped(CONTAINER)} {
  --chat-hairline: color-mix(in oklab, var(--foreground) 6%, transparent);
  --chat-shadow-tint: 81 108 108;
}

${scoped(`${CONTAINER} ${LAUNCHER}`)},
${scoped(`${CONTAINER} ${INFO}`)} {
  display: none !important;
}

${scoped(`${CONTAINER} ${PANEL}`)} {
  position: fixed !important;
  top: auto !important;
  left: auto !important;
  right: 6rem !important;
  bottom: 1.5rem !important;
  width: min(25rem, calc(100vw - 7.5rem)) !important;
  height: min(37.5rem, calc(100vh - 3rem)) !important;
  height: min(37.5rem, calc(100dvh - 3rem)) !important;
  max-height: none !important;
  /* Clips the square header and the pre-chat overlay to the rounded shell. */
  overflow: hidden !important;
  /* \`rounded-4xl\`, the radius the shadcn Card ships with. */
  border-radius: calc(var(--radius) * 2.6) !important;
  box-shadow:
    0 0 0 1px var(--chat-hairline),
    0 1.2rem 3rem rgb(var(--chat-shadow-tint) / 18%) !important;
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

${scoped(`${CONTAINER} ${PANEL}`)},
${scoped(`${CONTAINER} ${PANEL} *`)} {
  font-family: var(--font-sans) !important;
}

${scoped(`${CONTAINER} ${PANEL}`)} {
  background: var(--card) !important;
  color: var(--foreground) !important;
  /* The hairline is the ring above; a border here would double it. */
  border: 0 !important;
}

/* ---------------------------------------------------------------------------
   The header: a flat brand bar in the SDK's own \`space-between\` row - name and
   status on the left, minimise on the right. The panel's \`overflow: hidden\`
   clips its square top corners to the shell.
   --------------------------------------------------------------------------- */

${scoped(`${CONTAINER} .livechat-widget-header`)} {
  /* Also set here so the header still matches if the branded config fetch falls through. */
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  gap: 0.5rem !important;
  padding: 0.625rem 0.875rem !important;
  border-bottom: 0 !important;
  border-radius: 0 !important;
}

/* The channel name - \`header > left group > column > name row > name\`. The SDK inlines
   its font on the leaf itself, so the site's title face has to be set there too. */
${scoped(`${CONTAINER} .livechat-widget-header > div:first-child > div > div:first-child > div`)} {
  font-family: var(--font-title, var(--font-sans)) !important;
  font-size: 0.9375rem !important;
  /* Headings across the site are the title face at 600. */
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
}

${scoped(`${CONTAINER} .livechat-widget-header .status`)} {
  color: color-mix(in oklab, var(--primary-foreground) 82%, transparent) !important;
  font-size: 0.75rem !important;
}

${scoped(`${CONTAINER} .livechat-widget-header .status-dot`)} {
  background: var(--leaf) !important;
  box-shadow: 0 0 0 0.1875rem color-mix(in oklab, var(--leaf) 35%, transparent) !important;
}

/* The dialog's own close control is a round \`bg-secondary\` ghost button; on the filled
   header that reads as a translucent circle. Site buttons never scale on hover - they
   shift background and press down a pixel on \`:active\`. */
${scoped(`${CONTAINER} .back-btn`)},
${scoped(`${CONTAINER} .close-btn`)} {
  color: var(--primary-foreground) !important;
  background: color-mix(in oklab, var(--primary-foreground) 12%, transparent) !important;
  border-radius: 9999px !important;
  padding: 0.3125rem !important;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease !important;
}

${scoped(`${CONTAINER} .back-btn`, ':hover')},
${scoped(`${CONTAINER} .close-btn`, ':hover')} {
  background: color-mix(in oklab, var(--primary-foreground) 24%, transparent) !important;
}

${scoped(`${CONTAINER} .back-btn`, ':active')},
${scoped(`${CONTAINER} .close-btn`, ':active')} {
  transform: translateY(1px) !important;
}

${scoped(`${CONTAINER} .livechat-widget-messages`)} {
  /* The header carries the colour, so the thread stays on the panel's own surface with
     just enough of a wash under it to keep the two from reading as one flat sheet. */
  background:
    radial-gradient(
      70rem 16rem at 50% -3rem,
      color-mix(in oklab, var(--secondary) 22%, transparent),
      transparent 70%
    ),
    var(--card) !important;
  padding: 0.75rem 0.875rem 0.875rem !important;
  scrollbar-width: thin !important;
  scrollbar-color: color-mix(in oklab, var(--muted-foreground) 40%, transparent) transparent !important;
}

${scoped(`${CONTAINER} .livechat-widget-messages`, '::-webkit-scrollbar')} {
  width: 0.375rem !important;
}

/* Same thumb the site's \`.profile-scrollbar\` utility draws, hover shade included. */
${scoped(`${CONTAINER} .livechat-widget-messages`, '::-webkit-scrollbar-thumb')} {
  background-color: color-mix(in oklab, var(--muted-foreground) 40%, transparent) !important;
  border-radius: 9999px !important;
}

${scoped(`${CONTAINER} .livechat-widget-messages`, '::-webkit-scrollbar-thumb:hover')} {
  background-color: color-mix(in oklab, var(--muted-foreground) 62%, transparent) !important;
}

/* ---------------------------------------------------------------------------
   Bubbles. Every one of them is inline-styled by the SDK and nothing marks who
   sent it, so the two sides are told apart structurally: an agent row carries an
   avatar before the content column, a visitor row is the column on its own.
   Error rows keep the vendor's red - it is the only signal that a send failed.
   --------------------------------------------------------------------------- */

${scoped(`${CONTAINER} .message-container:not([data-message-state="error"]) > div:not(:first-child) > div:first-child`)} {
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  border: 0 !important;
  /* \`rounded-2xl\` with the house petal corner turned to the side the bubble hangs off. */
  border-radius: calc(var(--radius) * 1.8) !important;
  border-bottom-left-radius: calc(var(--radius) * 0.5) !important;
  box-shadow: 0 0.35rem 1rem rgb(var(--chat-shadow-tint) / 16%) !important;
}

${scoped(`${CONTAINER} .message-container:not([data-message-state="error"]) > div:only-child > div:first-child`)} {
  /* The soft counterpart the site uses for quiet panels - a secondary wash under the same
     hairline ring the cards carry, rather than a grey box with a border. */
  background: color-mix(in oklab, var(--secondary) 25%, var(--card)) !important;
  color: var(--foreground) !important;
  border: 0 !important;
  border-radius: calc(var(--radius) * 1.8) !important;
  border-bottom-right-radius: calc(var(--radius) * 0.5) !important;
  box-shadow: 0 0 0 1px var(--chat-hairline) !important;
}

${scoped(`${CONTAINER} .message-container > div > div:first-child`)} {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.8125rem !important;
  line-height: 1.5 !important;
}

/* The avatar is a plain circle behind an emoji or the channel logo; the spacer the SDK
   renders for stacked messages is \`opacity: 0\`, so the shadow rides along invisibly.
   The typing indicator gets the same treatment - otherwise its own emoji flashes on
   screen until the first real message with a masked avatar replaces it. */
${scoped(`${CONTAINER} ${AVATAR}`)},
${scoped(`${CONTAINER} ${TYPING_AVATAR}`)} {
  position: relative !important;
  background: var(--primary) !important;
  border-radius: 9999px !important;
  box-shadow: 0 0.35rem 1rem rgb(var(--chat-shadow-tint) / 14%) !important;
}

/* The dashboard hands each agent an emoji, which lands in the circle as a text node and
   reads as clip art next to the rest of the site. Collapse it - \`color\` cannot hide a
   colour glyph - and paint the house blossom in its place. Rows that carry a real logo
   keep it: the \`img\` is what the \`:has()\` guard is looking for. */
${scoped(`${CONTAINER} ${AVATAR}`, ':not(:has(img))')},
${scoped(`${CONTAINER} ${AVATAR}`, ':not(:has(img)) *')},
${scoped(`${CONTAINER} ${TYPING_AVATAR}`, ':not(:has(img))')},
${scoped(`${CONTAINER} ${TYPING_AVATAR}`, ':not(:has(img)) *')} {
  font-size: 0 !important;
  line-height: 0 !important;
}

${scoped(`${CONTAINER} ${AVATAR}`, ':not(:has(img))::after')},
${scoped(`${CONTAINER} ${TYPING_AVATAR}`, ':not(:has(img))::after')} {
  content: '' !important;
  position: absolute !important;
  inset: 24% !important;
  background-color: var(--primary-foreground) !important;
  -webkit-mask: url("${AVATAR_MARK}") center / contain no-repeat !important;
  mask: url("${AVATAR_MARK}") center / contain no-repeat !important;
}

${scoped(`${CONTAINER} .message-timestamp`)},
${scoped(`${CONTAINER} .message-timestamp span`)} {
  color: var(--muted-foreground) !important;
  font-size: 0.625rem !important;
}

${scoped(`${CONTAINER} .message-timestamp > span:first-child`)} {
  color: color-mix(in oklab, var(--primary) 85%, var(--foreground)) !important;
  font-weight: 600 !important;
}

/* Typing indicator - its own subtree, so it misses the bubble rules above. */
${scoped(`${CONTAINER} .typing-indicator > div > div:not(:first-child) > div:first-child`)} {
  background: color-mix(in oklab, var(--secondary) 25%, var(--card)) !important;
  border: 0 !important;
  border-radius: calc(var(--radius) * 1.8) !important;
  border-bottom-left-radius: calc(var(--radius) * 0.5) !important;
  box-shadow: 0 0 0 1px var(--chat-hairline) !important;
}

${scoped(`${CONTAINER} .typing-indicator span`)} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .typing-dots span`)} {
  background: color-mix(in oklab, var(--primary) 70%, transparent) !important;
}

${scoped(`${CONTAINER} .livechat-widget-input`)} {
  background: var(--card) !important;
  border-top: 1px solid var(--border) !important;
  padding: 0.625rem !important;
}

/* Their sheet forces \`.files-bar { display: flex !important }\`, which outranks the inline
   \`display: none\` the SDK sets when no files are attached - leaving an empty 8px strip
   above the composer. Collapse it while it holds no chips. */
${scoped(`${CONTAINER} .files-bar`, ':empty')} {
  display: none !important;
}

/* The composer, stacked: the message field on its own line with the send button under its
   right edge. The wrapper above already draws the divider, so the row's own border-top
   would otherwise stack into 2px. This channel has file upload off and the SDK ships no
   emoji picker, so the button strip only ever holds send. */
${scoped(`${CONTAINER} .livechat-widget-input > div:not(.files-bar)`)} {
  /* The site's fields are a half-strength \`--input\` wash behind a transparent border that
     only takes the ring colour on focus - see the shared Input / Textarea. */
  background: color-mix(in oklab, var(--input) 50%, transparent) !important;
  border: 1px solid transparent !important;
  border-radius: calc(var(--radius) * 1.8) !important;
  align-items: flex-end !important;
  gap: 0.375rem !important;
  padding: 0.375rem 0.375rem 0.375rem 0.625rem !important;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease !important;
}

${scoped(`${CONTAINER} .livechat-widget-input > div:not(.files-bar) > div`)} {
  margin-left: 0 !important;
}

${scoped(`${CONTAINER} .livechat-widget-input > div:not(.files-bar)`, ':focus-within')} {
  border-color: var(--ring) !important;
  box-shadow: 0 0 0 0.1875rem color-mix(in oklab, var(--ring) 30%, transparent) !important;
}

${scoped(`${CONTAINER} .livechat-widget-input textarea`)} {
  color: var(--foreground) !important;
  font-size: 0.8125rem !important;
  padding: 0.375rem !important;
  /* The resting size before the resize loop below takes over on the first keystroke. */
  min-height: ${TEXTAREA_MIN_HEIGHT_PX}px !important;
  max-height: ${TEXTAREA_MAX_HEIGHT_PX}px !important;
}

${scoped(`${CONTAINER} .livechat-widget-input textarea`, '::placeholder')} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .send-btn`)} {
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  width: 2.25rem !important;
  height: 2.25rem !important;
  /* The SDK's own sheet forces a 50% radius; the site's buttons are \`rounded-4xl\` squircles. */
  border-radius: calc(var(--radius) * 2.6) !important;
  box-shadow: 0 0.45rem 1.2rem rgb(var(--chat-shadow-tint) / 10%) !important;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease !important;
}

/* \`hover:bg-primary/80\` then \`active:translate-y-px\` - the shared Button, exactly. */
${scoped(`${CONTAINER} .send-btn`, ':hover')} {
  background: color-mix(in oklab, var(--primary) 80%, transparent) !important;
}

${scoped(`${CONTAINER} .send-btn`, ':active')} {
  transform: translateY(1px) !important;
}

${scoped(`${CONTAINER} .send-btn svg`)},
${scoped(`${CONTAINER} .upload-btn svg`)} {
  width: 1.0625rem !important;
  height: 1.0625rem !important;
}

${scoped(`${CONTAINER} .upload-btn`)} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .upload-btn`, ':hover')} {
  background: color-mix(in oklab, var(--primary) 12%, transparent) !important;
}

${scoped(`${CONTAINER} .livechat-widget-footer`)} {
  display: none !important;
}

/* The shared Badge: \`rounded-3xl\`, transparent border, secondary pair, \`hover:bg-secondary/80\`. */
${scoped(`${CONTAINER} .suggestion-btn`)} {
  border-color: transparent !important;
  color: var(--secondary-foreground) !important;
  background: var(--secondary) !important;
  border-radius: calc(var(--radius) * 2.2) !important;
  font-size: 0.75rem !important;
  transition: background-color 0.2s ease !important;
}

${scoped(`${CONTAINER} .suggestion-btn`, ':hover')} {
  background: color-mix(in oklab, var(--secondary) 80%, transparent) !important;
}

/* Pre-chat form - \`collection_customer\` gates the conversation behind name + phone. It is a
   dialog, so it takes the shared Dialog's scrim and shell rather than the panel's radii. */
${scoped(`${CONTAINER} .customer-form-popup`)} {
  background: rgb(0 0 0 / 30%) !important;
  backdrop-filter: blur(0.25rem) !important;
}

${scoped(`${CONTAINER} .customer-info-form-container`)} {
  background: var(--popover) !important;
  border: 0 !important;
  border-radius: calc(var(--radius) * 1.4) !important;
  box-shadow:
    0 0 0 1px var(--chat-hairline),
    0 1.25rem 3rem rgb(var(--chat-shadow-tint) / 24%) !important;
}

${scoped(`${CONTAINER} .customer-form-header h3`)} {
  font-family: var(--font-title, var(--font-sans)) !important;
  font-weight: 600 !important;
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
  background: color-mix(in oklab, var(--input) 50%, transparent) !important;
  color: var(--foreground) !important;
  border: 1px solid transparent !important;
  border-radius: calc(var(--radius) * 2.2) !important;
}

${scoped(`${CONTAINER} .customer-form-input`, '::placeholder')} {
  color: var(--muted-foreground) !important;
}

${scoped(`${CONTAINER} .customer-form-input`, ':focus')},
${scoped(`${CONTAINER} .customer-form-field select`, ':focus')} {
  border-color: var(--ring) !important;
  box-shadow: 0 0 0 0.1875rem color-mix(in oklab, var(--ring) 30%, transparent) !important;
}

${scoped(`${CONTAINER} .submit-btn`)},
${scoped(`${CONTAINER} .btn-create-new-session`)},
${scoped(`${CONTAINER} .confirm-end-conversation`)} {
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
  border-radius: calc(var(--radius) * 2.6) !important;
  box-shadow: 0 0.45rem 1.2rem rgb(var(--chat-shadow-tint) / 10%) !important;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease !important;
}

/* The phone panel is barely half the height of the desktop one, so the header and the
   composer give some of it back to the thread. */
@media (max-width: 639px) {
  ${scoped(`${CONTAINER} .livechat-widget-header`)} {
    padding: 0.5rem 0.75rem !important;
  }

  ${scoped(`${CONTAINER} .livechat-widget-messages`)} {
    padding: 0.625rem 0.75rem 0.75rem !important;
  }

  ${scoped(`${CONTAINER} .livechat-widget-input`)} {
    padding: 0.5rem !important;
  }

  ${scoped(`${CONTAINER} .livechat-widget-input textarea`)} {
    min-height: 2rem !important;
  }

  ${scoped(`${CONTAINER} .send-btn`)} {
    width: 2.125rem !important;
    height: 2.125rem !important;
  }
}

${scoped(`${CONTAINER} .submit-btn`, ':hover')},
${scoped(`${CONTAINER} .btn-create-new-session`, ':hover')},
${scoped(`${CONTAINER} .confirm-end-conversation`, ':hover')} {
  background: color-mix(in oklab, var(--primary) 80%, transparent) !important;
}

${scoped(`${CONTAINER} .submit-btn`, ':active')},
${scoped(`${CONTAINER} .btn-create-new-session`, ':active')},
${scoped(`${CONTAINER} .confirm-end-conversation`, ':active')},
${scoped(`${CONTAINER} .cancel-end-conversation`, ':active')} {
  transform: translateY(1px) !important;
}

${scoped(`${CONTAINER} .cancel-end-conversation`)} {
  background: var(--secondary) !important;
  color: var(--secondary-foreground) !important;
  border-radius: calc(var(--radius) * 2.6) !important;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease !important;
}

${scoped(`${CONTAINER} .cancel-end-conversation`, ':hover')} {
  background: color-mix(in oklch, var(--secondary), var(--foreground) 5%) !important;
}
`

type CloudGoConfig = Record<string, unknown>

/** The slice of the vendor's LiveChatSDK instance we read to tell whether it can be used. */
interface CloudGoInstance {
  isConnected?: boolean
  requiresCustomerInfo?: boolean
  customerInfoSubmitted?: boolean
  /** Written back when we undo an open the SDK started on its own - see `forceClosePanel`. */
  isOpen?: boolean
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

/**
 * A first visit with `collection_customer` on ends `init()` in `showCustomerInfoFormInWidget()`,
 * which opens the panel itself - so any device without a stored session lands on the pre-chat
 * form nobody asked for. Put the panel back the way the SDK's own `closeWidget()` leaves it,
 * `isOpen` included, so the next tap on our bubble still opens rather than toggles shut.
 */
function forceClosePanel(panel: HTMLElement) {
  panel.style.opacity = '0'
  panel.style.pointerEvents = 'none'
  panel.style.display = 'none'
  if (instance) instance.isOpen = false
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

  observer.observe(document.body, { childList: true, subtree: true })

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
  /** Only an open we asked for is allowed on screen; anything else is the SDK opening itself. */
  const allowOpenRef = useRef(false)
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
        allowOpenRef.current = true
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

    let themedHost: HTMLElement | null = null

    /** Returns whether the widget was found and bound; a `false` means "try again shortly". */
    const attach = (host: HTMLElement) => {
      if (disposed) return true

      if (host !== themedHost) {
        themedHost = host
        applyThemeTokens(host, readThemeTokens())
      }

      const root = getWidgetRoot(host)

      // Before the container check, so the mask is already in place once the SDK starts
      // painting bubbles - otherwise a typing indicator that lands before `container` exists
      // flashes the vendor's raw emoji until the next attach() call adds the sheet.
      ensureOverrideStyles(root)

      const container = root.querySelector(CONTAINER)
      if (!container) return false

      let panelObserver: MutationObserver | null = null
      let launcherObserver: MutationObserver | null = null

      const bind = () => {
        const launcher = container.querySelector<HTMLElement>(LAUNCHER)
        const panel = container.querySelector<HTMLElement>(PANEL)

        // The SDK re-shows its info bubble with an inline `!important`, which CSS can't beat.
        container.querySelectorAll(INFO).forEach((node) => node.remove())
        launcher?.style.setProperty('display', 'none', 'important')

        const textarea = container.querySelector<HTMLTextAreaElement>(TEXTAREA)
        if (textarea) {
          textarea.maxLength = MESSAGE_MAX_LENGTH

          if (!textarea.dataset.autoResizeBound) {
            textarea.dataset.autoResizeBound = 'true'
            const resize = () => {
              textarea.style.setProperty('height', 'auto', 'important')
              const next = Math.min(Math.max(textarea.scrollHeight, TEXTAREA_MIN_HEIGHT_PX), TEXTAREA_MAX_HEIGHT_PX)
              textarea.style.setProperty('height', `${next}px`, 'important')
            }
            textarea.addEventListener('input', resize)
            resize()
          }
        }

        if (launcher && launcher !== launcherRef.current) {
          launcherRef.current = launcher
          launcherObserver?.disconnect()
          launcherObserver = new MutationObserver(() => setHasUnread(launcher.classList.contains(UNREAD_CLASS)))
          launcherObserver.observe(launcher, { attributes: true, attributeFilter: ['class'] })
        }

        if (panel) {
          const syncOpen = () => {
            const open = readPanelOpen(panel)

            if (open && !allowOpenRef.current) {
              forceClosePanel(panel)
              return
            }

            // The SDK opens in two steps - `display` first, `opacity` a tick later - so the
            // panel reads as closed in between. Only a finished close clears the permission.
            if (panel.style.display === 'none') allowOpenRef.current = false
            setIsOpen(open)
          }

          panelObserver?.disconnect()
          panelObserver = new MutationObserver(syncOpen)
          panelObserver.observe(panel, { attributes: true, attributeFilter: ['style'] })
          syncOpen()
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

      return true
    }

    /**
     * The SDK appends its host element before it has finished building the widget inside it,
     * and on a slow phone that gap is wide enough for the first `attach` to find no container
     * at all. Giving up there would leave the panel unguarded - the pre-chat form the SDK
     * opens by itself at the end of `init()` then just stays on screen - so keep looking.
     * A shadow root attached after the host lands is invisible to a MutationObserver, hence
     * a poll rather than another observer.
     */
    let retryTimer: ReturnType<typeof setInterval> | null = null

    const stopRetry = () => {
      if (!retryTimer) return
      clearInterval(retryTimer)
      retryTimer = null
    }
    teardown.push(stopRetry)

    const startedAt = performance.now()

    const retryAttach = () => {
      const host = document.getElementById(HOST_ID)
      if ((host && attach(host)) || performance.now() - startedAt > ATTACH_TIMEOUT_MS) stopRetry()
    }

    const stopHostObserver = observeWidgetHost((host) => {
      if (attach(host)) return
      retryTimer ??= setInterval(retryAttach, ATTACH_POLL_MS)
    })
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
      allowOpenRef.current = !isOpen
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
