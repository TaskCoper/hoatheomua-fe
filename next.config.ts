import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 55, 65, 70, 75],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30
  },
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'motion',
      '@hugeicons/react',
      '@hugeicons/core-free-icons',
      'embla-carousel-react',
      'embla-carousel-autoplay',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      'radix-ui'
    ]
  }
}

export default withNextIntl(nextConfig)
