import type messages from './messages/en.json'
import type { routing } from './routing'

export type Locale = (typeof routing.locales)[number]
export type Dictionary = Record<string, unknown>

type Primitive = string | number | boolean | null | undefined

type DotPath<T> = {
  [K in Extract<keyof T, string>]: T[K] extends Primitive
    ? K
    : T[K] extends readonly unknown[]
      ? never
      : `${K}.${DotPath<T[K]>}`
}[Extract<keyof T, string>]

type NamespacePath<T> = {
  [K in Extract<keyof T, string>]: T[K] extends Primitive
    ? never
    : T[K] extends readonly unknown[]
      ? never
      : K | `${K}.${NamespacePath<T[K]>}`
}[Extract<keyof T, string>]

export type I18nKey = DotPath<typeof messages>
export type I18nNamespace = NamespacePath<typeof messages>
