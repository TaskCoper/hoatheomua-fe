import 'server-only'

import { getPublicConfigsGroup } from '@/features/public-configs/queries.server'
import { parseB2BOverview, type B2BOverview } from './_overview-palette'

const B2B_SERVICES_GROUP = 'b2bServices'
const OVERVIEW_KEY_SUFFIX = 'overview'

type B2BConfigItem = { key: string; value: { value: string } }

/**
 * Fetch + parse the single `b2bServices.overview` document. Shares the same
 * per-request-cached `b2bServices` group fetch as `getB2BServiceDetails()`
 * (see `[service]/_data.server.ts`), so loading both on the same page is free.
 * Falls back to a fully-defaulted overview when the document is absent.
 */
export const getB2BOverview = async (): Promise<B2BOverview> => {
  const configs = await getPublicConfigsGroup<B2BConfigItem>(B2B_SERVICES_GROUP)
  const doc = configs.find((config) => config.key?.toLowerCase().endsWith(OVERVIEW_KEY_SUFFIX))

  return parseB2BOverview(doc?.value?.value)
}
