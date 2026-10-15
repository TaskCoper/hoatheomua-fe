import { Toaster } from '@/components/ui/sonner'
import SentryUserContext from '@/features/users/components/sentry-user-context'
import { routing } from '@/lib/i18n/routing'
import ReactQueryProvider from '@/lib/react-query'
import ConfirmDialog from '@/shared/components/confirm-dialog'
import RouteScrollReset from '@/shared/components/route-scroll-reset'
import ViewportInsets from '@/shared/components/viewport-insets'
import { IS_UNDER_DEVELOPMENT } from '@/shared/feature-flags'
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Be_Vietnam_Pro, Lora } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import '../globals.css'

// Namespaces that are large AND only used inside a single route-tree; they
// don't need to ship in the initial client bundle on other routes. Individual
// route layouts add nested providers for these.
const HEAVY_ROUTE_NAMESPACES = [
  'about',
  'admin',
  'b2b',
  'careers',
  'dataTable',
  'recruitment',
  'richTextEditor',
  'womenDay'
] as const

function pickClientMessages(messages: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(messages)) {
    if (!(HEAVY_ROUTE_NAMESPACES as readonly string[]).includes(k)) out[k] = v
  }
  return out
}

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['vietnamese'],
  display: 'swap',
  variable: '--font-sans',
  preload: false,
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']
})

const lora = Lora({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-title',
  preload: false,
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif']
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoatheomua.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hoa Theo Mùa - Hoa tươi cao cấp, giao tận nơi trong 2 giờ tại TP.HCM',
    template: '%s | Hoa Theo Mùa'
  },
  description:
    'Hoa Theo Mùa - Hệ thống hoa tươi online tại TP. Hồ Chí Minh, chuyên cung cấp hoa tươi cao cấp và giao hoa tận nơi siêu nhanh trong 2 giờ.',
  applicationName: 'Hoa Theo Mùa',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: true, address: true, email: true },
  icons: { icon: '/icon.png' },
  verification: { google: 'bQgPNiK9Fmh9tn8QPEVQx-q3wURq6vuuw1xn-V3_5Vs' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#eef3f0'
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  modal,
  params
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()
  const clientMessages = pickClientMessages(messages as Record<string, unknown>)

  return (
    <html
      lang={locale}
      className={`${beVietnamPro.variable} ${lora.variable} font-sans h-full antialiased ${
        IS_UNDER_DEVELOPMENT ? 'has-dev-banner' : ''
      }`}
    >
      <body className='min-h-full flex flex-col'>
        <RouteScrollReset />
        <ViewportInsets />

        <NuqsAdapter>
          <NextIntlClientProvider messages={clientMessages}>
            <ReactQueryProvider>
              <SentryUserContext />
              {children}
              {modal}
              <Toaster position='top-center' duration={2000} />
              <ConfirmDialog />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>

        <GoogleAnalytics gaId='G-Y325BZPY95' />
      </body>
    </html>
  )
}
