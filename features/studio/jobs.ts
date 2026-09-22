import api from '@/lib/axios'
import z from 'zod'
import type { AiFlower, CreateAiFlowerPayload, RegenerateAiFlowerPayload } from './types'

const productRef = z.object({
  id: z.string(),
  name: z.string(),
  attributes: z.object({
    productCode: z.string().nullable(),
    productType: z.string().nullable(),
    size: z.string().nullable(),
    color: z.string().nullable()
  }),
  image: z.object({ url: z.string().nullable() }),
  observedStatus: z.object({ isActive: z.boolean(), isDeleted: z.boolean() })
})
const material = z.object({
  matId: z.string(),
  quantity: z.number(),
  name: z.string(),
  isCore: z.boolean(),
  coverImage: z.string().nullable()
})
const flowerSchema: z.ZodType<AiFlower> = z.object({
  id: z.string(),
  sessionId: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  flowerImageUrl: z.string().nullable().default(null),
  flowerWithMockupImageUrl: z.string().nullable().default(null),
  flowerWithLogoImageUrl: z.string().nullable().default(null),
  createdAt: z.string(),
  metadata: z.object({
    subId: z.string(),
    aiCustomize: z.boolean(),
    ribbon: productRef.nullable(),
    wrappingPaper: productRef.nullable(),
    AdditionCustome: z.array(material),
    materials: z.array(material)
  })
})
export const flowerJobSchema = z
  .object({
    jobId: z.string(),
    type: z.enum(['Create', 'Regenerate']),
    status: z.enum(['Queued', 'Running', 'Succeeded', 'Failed', 'Canceled']),
    stage: z.enum(['Queued', 'GeneratingFlower', 'ApplyingMockup', 'Branding', 'Saving', 'Completed']),
    displayName: z.string(),
    productId: z.string(),
    productImageUrl: z.string().nullable(),
    mockupImageUrl: z.string().nullable(),
    sourceFlowerId: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    completedAt: z.string().nullable(),
    cancelRequested: z.boolean(),
    errorCode: z.string().nullable(),
    result: flowerSchema.nullable()
  })
  .refine((job) => job.status !== 'Succeeded' || job.result !== null, 'Succeeded job must contain a result')
export type FlowerJob = z.infer<typeof flowerJobSchema>
export const isActiveJob = (job: FlowerJob) => job.status === 'Queued' || job.status === 'Running'
export const jobStageIndex = (job?: FlowerJob) =>
  !job ? 0 : { Queued: 0, GeneratingFlower: 1, ApplyingMockup: 2, Branding: 3, Saving: 3, Completed: 4 }[job.stage]
export const JOBS_KEY = ['flower-jobs'] as const

export const flowerJobs = {
  async submit(body: CreateAiFlowerPayload | RegenerateAiFlowerPayload, key: string, sourceFlowerId?: string) {
    const path = sourceFlowerId ? `v1/ai-flowers/${sourceFlowerId}/regeneration-jobs` : 'v1/ai-flower-jobs'
    const { data } = await api.post(path, body, { headers: { 'Idempotency-Key': key } })
    return flowerJobSchema.parse(data.value)
  },
  async get(jobId: string, signal?: AbortSignal) {
    const { data } = await api.get(`v1/ai-flower-jobs/${jobId}`, { signal })
    return flowerJobSchema.parse(data.value)
  },
  async list(pageIndex: number, signal?: AbortSignal) {
    // Include completed jobs so returning after completion does not lose the result.
    const { data } = await api.get('v1/ai-flower-jobs', { params: { active: false, pageIndex, pageSize: 12 }, signal })
    return z
      .object({ items: z.array(flowerJobSchema), hasNextPage: z.boolean(), totalCount: z.number() })
      .parse(data.value)
  },
  async cancel(jobId: string) {
    const { data } = await api.post(`v1/ai-flower-jobs/${jobId}/cancel`)
    return flowerJobSchema.parse(data.value)
  }
}
