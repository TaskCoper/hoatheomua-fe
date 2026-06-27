import { z } from 'zod'

export const ApiEnvelope = <T extends z.ZodTypeAny>(value: T) =>
  z.object({
    value: value.nullable(),
    isSuccess: z.boolean(),
    isFailed: z.boolean(),
    error: z.unknown(),
    traceId: z.string(),
    timestampUtc: z.string()
  })
