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
