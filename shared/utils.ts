import { GetPresignedUrlParams } from '@/hooks/use-get-presigned-url'
import { BasePaginationResponse } from '@/lib/axios'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a clean, unique key and identifies the content type
 */
export const prepareFileUpload = (file: File, folder: string = 'general'): GetPresignedUrlParams => {
  const extension = file.name.split('.').pop()

  const nameSlug = file.name
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')

  const uniqueId = Math.random().toString(36).substring(2, 8)

  const key = `${folder}/${uniqueId}-${nameSlug}.${extension}`

  return {
    key,
    contentType: file.type || 'application/octet-stream'
  }
}

export const getAvatarFallback = (fullName: string) =>
  fullName
    .split(' ')
    .map((n) => n[0])
    .join('')

const defaultPaginationResponse: BasePaginationResponse<unknown> = {
  value: {
    items: [],
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  },
  error: {
    code: '',
    message: ''
  },
  isSuccess: true,
  isFailed: false,
  traceId: '',
  timestampUtc: new Date().toISOString()
}

export function getDefaultPaginationResponse<T>(): BasePaginationResponse<T> {
  return defaultPaginationResponse as BasePaginationResponse<T>
}

const NAMED_HTML_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'"
}

const decodeHtmlEntities = (input: string): string =>
  input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const codePoint = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }
    return NAMED_HTML_ENTITIES[entity.toLowerCase()] ?? match
  })

export const isModifiedClick = (event: {
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  button: number
}): boolean => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0

export const getFirstParagraphTextFromHtml = (html: string | null | undefined): string => {
  if (!html) return ''

  const firstParagraphMatch = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)
  const inner = firstParagraphMatch?.[1] ?? ''

  return decodeHtmlEntities(inner.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}
