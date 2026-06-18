const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const config = {
  baseFileUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_FILE_BASE_URL ?? '')
} as const

export default config
