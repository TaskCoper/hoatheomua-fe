import type en from '@/app/[lang]/dictionaries/en.json'

export type Locale = 'vi' | 'en'
export type Dictionary = Record<string, unknown>

type Primitive = string | number | boolean | null | undefined

type DotPath<T> = {
  [K in Extract<keyof T, string>]: T[K] extends Primitive
    ? K
    : T[K] extends readonly unknown[]
      ? never
      : `${K}.${DotPath<T[K]>}`
}[Extract<keyof T, string>]

export type I18nKey = DotPath<typeof en>
