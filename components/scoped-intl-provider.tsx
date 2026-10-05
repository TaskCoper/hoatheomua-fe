import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { type ReactNode } from 'react'

const ROOT_STRIPPED_NAMESPACES = new Set([
  'about',
  'admin',
  'b2b',
  'careers',
  'dataTable',
  'recruitment',
  'richTextEditor',
  'womenDay'
])

interface ScopedIntlProviderProps {
  namespaces: readonly string[]
  children: ReactNode
}

// Wraps children in a NextIntlClientProvider carrying the root layout's
// baseline client messages plus the extra namespaces this route needs.
//
// next-intl v4 nested providers REPLACE the outer messages context rather
// than merging, so we manually rebuild the union here.
export default async function ScopedIntlProvider({ namespaces, children }: ScopedIntlProviderProps) {
  const messages = (await getMessages()) as Record<string, unknown>
  const merged: Record<string, unknown> = {}

  const extras = new Set(namespaces)
  for (const [key, value] of Object.entries(messages)) {
    if (!ROOT_STRIPPED_NAMESPACES.has(key) || extras.has(key)) {
      merged[key] = value
    }
  }

  return <NextIntlClientProvider messages={merged}>{children}</NextIntlClientProvider>
}
