export const ACCOUNT_SECTIONS = ['orders', 'studio', 'cards', 'info', 'address', 'password'] as const

export type AccountSection = (typeof ACCOUNT_SECTIONS)[number]

export const isAccountSection = (value: string | undefined): value is AccountSection =>
  !!value && (ACCOUNT_SECTIONS as readonly string[]).includes(value)

export const ACCOUNT_FALLBACK_HREF = '/'

export const buildAccountHref = (slug: string | undefined | null, section?: AccountSection) => {
  if (!slug) return ACCOUNT_FALLBACK_HREF

  return section ? `/users/${slug}?section=${section}` : `/users/${slug}`
}
