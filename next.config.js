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
      (rule) => rule.loader === 'next-image-loader',
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
}

export default config
