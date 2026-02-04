/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    useCache: true,
  },

  turbopack: {
    rules: {
      '*.icon.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      // PostHog
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://eu.i.posthog.com/decide',
      },
    ]
  },

  skipTrailingSlashRedirect: true, // This is required to support PostHog trailing slash API requests
  productionBrowserSourceMaps: true,
  output: 'standalone',
}

export default config
