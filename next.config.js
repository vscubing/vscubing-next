/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

// NOTE: resourceQueries in rules don't work in turbopack yet :(

/** @type {import("next").NextConfig} */
const config = {
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
      {
        source: '/debug/static/:path*',
        destination: 'https://facebook.com',
      },
      {
        source: '/debug/:path*',
        destination: 'https://google.com',
      },
      {
        source: '/debug/decide',
        destination: 'https://instagram.com',
      },
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
