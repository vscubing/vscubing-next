/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

// NOTE: resourceQueries in rules don't work in turbopack yet :(

/** @type {import("next").NextConfig} */
const config = {
  webpack(config) {
    // Find the default image loader rule
    const imageLoaderRule = config.module.rules.find(
      (/** @type {{ loader: string; }} */ rule) =>
        rule.loader === 'next-image-loader',
    )
    if (imageLoaderRule == null) {
      throw new Error('Image loader rule not found')
    }

    // Duplicate, tweak, and add it
    const svgImageLoaderRule = structuredClone(imageLoaderRule)
    svgImageLoaderRule.test = /\.svg$/
    svgImageLoaderRule.resourceQuery.not.push(/inline/)
    config.module.rules.push(svgImageLoaderRule)

    // SVGR rule, as before
    config.module.rules.push({
      test: /\.svg$/,
      resourceQuery: /inline/,
      issuer: { not: /\.(css|scss|sass)$/ },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    })
    return config
  },
  experimental: {
    typedRoutes: true,
    urlImports: ['https://code.jquery.com'],

    // turbo: {
    //   rules: {
    //     '*.svg?inline': { // ?inline doesn't work
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //   },
    // },
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

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  productionBrowserSourceMaps: true,
}

export default config
