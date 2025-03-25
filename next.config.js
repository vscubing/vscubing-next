/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

// NOTE: only turbopack works, there is no way to include/exclude resource queries in turbopack like .svg?svgr, so I used a suffix .icon.svg, which doesn't work with webpack

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    turbo: {
      rules: {
        '*.icon.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
}

export default config
