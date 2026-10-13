import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for the upcoming VPS
  // migration - run with `node .next/standalone/server.js`. No-op cost on Vercel.
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pos.nvncdn.com'
      },
      {
        protocol: 'https',
        hostname: 'hoatheomua.net'
      },
      {
        protocol: 'https',
        hostname: 'taskcoper.hcm.ss.bfcplatform.vn'
      },
      // Same bucket, path-style: the card and flower APIs hand back this form.
      {
        protocol: 'https',
        hostname: 'hcm.ss.bfcplatform.vn',
        pathname: '/taskcoper/**'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 55, 60, 65, 70, 75, 80],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30
  },
  compress: true,
  // Not set on purpose: withSentryConfig turns browser source maps on for the
  // Turbopack build, uploads them, then deletes them (see sourcemaps below).
  // An explicit `false` here makes it skip client maps entirely.
  poweredByHeader: false,
  experimental: {
    useCache: true,
    optimizeCss: true,
    staticGenerationMaxConcurrency: 3,
    staticGenerationRetryCount: 2,
    optimizePackageImports: [
      'motion',
      '@hugeicons/react',
      '@hugeicons/core-free-icons',
      'embla-carousel-react',
      'embla-carousel-autoplay',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      'radix-ui',
      '@tanstack/react-query',
      'sonner',
      'nuqs',
      'date-fns',
      '@base-ui/react',
      '@floating-ui/react'
    ]
  }
}

export default withSentryConfig(withBundleAnalyzer(withNextIntl(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'dahn-i7',

  project: 'hoatheomua-fe',

  // Print source-map upload logs in CI and in the Docker build (which sets the token but not CI)
  silent: !process.env.CI && !process.env.SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Never serve the maps publicly once they're uploaded
  sourcemaps: { deleteSourcemapsAfterUpload: true },

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true
    }
  }
})
