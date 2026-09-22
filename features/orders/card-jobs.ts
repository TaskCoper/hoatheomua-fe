import api from '@/lib/axios'
import z from 'zod'
import type { GetOrderDetailCardsParams, RegenerateAiCardPayload } from './types'

export const cardJobSchema = z
  .object({
    jobId: z.string().uuid(),
    type: z.enum(['Create', 'Regenerate']),
    status: z.enum(['Queued', 'Running', 'Succeeded', 'Failed', 'Canceled']),
    stage: z.enum(['Queued', 'GeneratingCard', 'Saving', 'Completed']),
    orderDetailId: z.string().uuid(),
    virtualId: z.string().uuid(),
    displayName: z.string(),
    cancelRequested: z.boolean(),
    errorCode: z.string().nullable(),
    result: z.object({ id: z.string().uuid(), imageUrl: z.string().url() }).passthrough().nullable()
  })
  .refine((job) => job.status !== 'Succeeded' || job.result !== null)
export type CardJob = z.infer<typeof cardJobSchema>
export const activeCardJob = (job?: CardJob) => job?.status === 'Queued' || job?.status === 'Running'
export const CARD_JOBS_KEY = ['card-jobs'] as const
export const cardJobs = {
  async submit(body: RegenerateAiCardPayload, key: string) {
    const { data } = await api.post('v1/ai-card-jobs', body, { headers: { 'Idempotency-Key': key } })
    return cardJobSchema.parse(data.value)
  },
  async get(id: string, signal?: AbortSignal) {
    const { data } = await api.get(`v1/ai-card-jobs/${id}`, { signal })
    return cardJobSchema.parse(data.value)
  },
  async list({ orderDetailsId, virtualId }: GetOrderDetailCardsParams, signal?: AbortSignal) {
    const { data } = await api.get('v1/ai-card-jobs', {
      params: { orderDetailId: orderDetailsId, virtualId, active: false, pageSize: 50 },
      signal
    })
    return z.object({ items: z.array(cardJobSchema) }).parse(data.value).items
  },
  async cancel(id: string) {
    const { data } = await api.post(`v1/ai-card-jobs/${id}/cancel`)
    return cardJobSchema.parse(data.value)
  }
}
