import { Toaster } from '@/components/ui/sonner'
import { routing } from '@/lib/i18n/routing'
import ReactQueryProvider from '@/lib/react-query'
import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import '../globals.css'

const fontVariables = {
  '--font-sans': 'ui-sans-serif, system-ui, sans-serif',
  '--font-title': 'Georgia, Cambria, Times New Roman, serif'
} as React.CSSProperties & Record<string, string>

export const metadata: Metadata = {
  title: 'Hoa Theo Mùa',
  description: 'Hoa Theo Mùa'
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

  return (
    <html lang={locale} className='font-sans h-full antialiased' style={fontVariables}>
      <body className='min-h-full flex flex-col'>
        <NuqsAdapter>
          <NextIntlClientProvider>
            <ReactQueryProvider>
              {children}
              {modal}
              <Toaster position='top-center' duration={2000} />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
