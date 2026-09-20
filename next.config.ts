import bundleAnalyzer from '@next/bundle-analyzer'
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
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  experimental: {
    useCache: true,
    optimizeCss: true,
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

export default withBundleAnalyzer(withNextIntl(nextConfig))
