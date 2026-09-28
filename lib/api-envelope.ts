import { z } from 'zod'

import type { ErrorResponse } from './axios'

export const ApiEnvelope = <T extends z.ZodTypeAny>(value: T) =>
  z.object({
    value: value.nullable(),
    isSuccess: z.boolean(),
    isFailed: z.boolean(),
    error: z.unknown(),
    traceId: z.string(),
    timestampUtc: z.string()
  })

const STATUS_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
}

export const apiErrorBody = ({
  status,
  detail,
  messageCode,
  title
}: {
  status: number
  detail: string
  messageCode: string
  title?: string
}): ErrorResponse => ({
  title: title ?? STATUS_TITLES[status] ?? 'Error',
  status,
  detail,
  messageCode,
  errors: null,
  traceId: '',
  timestampUtc: new Date().toISOString()
})

export const apiErrorJson = (args: Parameters<typeof apiErrorBody>[0], extra?: Record<string, unknown>): Response =>
  Response.json({ ...extra, ...apiErrorBody(args) }, { status: args.status })
