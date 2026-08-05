export const CACHE_LIFE = {
  // 30s tier — public-configs group, company-address, b2b (inherits configs)
  configs: { stale: 30, revalidate: 30, expire: 300 },
  // 60s tier — products list, articles list
  list: { stale: 60, revalidate: 60, expire: 300 },
  // 600s tier — recruitment list + detail
  recruitment: { stale: 600, revalidate: 600, expire: 3600 },
  // 1h tier — categories, company/contact configs, featured/occasions/mainline, product + article detail
  static1h: { stale: 3600, revalidate: 3600, expire: 86400 }
} satisfies Record<string, { stale: number; revalidate: number; expire: number }>
