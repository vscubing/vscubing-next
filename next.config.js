/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from './src/env.js'

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
      // Socket.io proxy
      // {
      //   source: '/api/socket',
      //   destination: `${env.SOCKET_SERVER_URL}/socket.io/`,
      // },
      // {
      //   source: '/api/socket/:path*',
      //   destination: `${env.SOCKET_SERVER_URL}/socket.io/:path*`,
      // },
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
