import 'server-only'

import { getPublicConfigsGroup } from '@/features/public-configs/queries.server'
import { B2B_SERVICE_SLUGS, type B2BServiceSlug } from '@/features/b2b/seo'
import { parseB2BServiceDetail, type B2BServiceDetail } from '@/features/b2b/service/palette'

const B2B_SERVICES_GROUP = 'b2bServices'

type B2BServiceConfigItem = { key: string; value: { value: string } }

/**
 * Fetch + parse every `b2bServices.<slug>` document, keyed by the parsed
 * `slug` (robust to key casing). Deduped/cached per request by the shared
 * `getPublicConfigsGroup` loader (ISR-revalidated).
 */
export const getB2BServiceDetails = async (): Promise<Map<B2BServiceSlug, B2BServiceDetail>> => {
  const configs = await getPublicConfigsGroup<B2BServiceConfigItem>(B2B_SERVICES_GROUP)
  const known = new Set<string>(B2B_SERVICE_SLUGS)
  const map = new Map<B2BServiceSlug, B2BServiceDetail>()

  for (const config of configs) {
    const detail = parseB2BServiceDetail(config.value?.value)
    if (detail.enabled && known.has(detail.slug)) map.set(detail.slug, detail)
  }

  return map
}

export const getB2BServiceDetail = async (slug: B2BServiceSlug): Promise<B2BServiceDetail | null> =>
  (await getB2BServiceDetails()).get(slug) ?? null
