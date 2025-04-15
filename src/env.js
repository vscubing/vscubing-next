import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    GH_DOKPLOY_WEBHOOK_URL:
      process.env.NEXT_PUBLIC_APP_ENV === 'development'
        ? z.undefined()
        : z.string().url(),
    AUTH_SECRET: z.string(),
    AUTH_GOOGLE_CLIENT_ID: z.string(),
    AUTH_GOOGLE_CLIENT_SECRET: z.string(),
    AUTH_GOOGLE_URL: z.string().url(),
    AUTH_WCA_CLIENT_ID: z.string(),
    AUTH_WCA_CLIENT_SECRET: z.string(),
    AUTH_WCA_URL: z.string().url(),
    TELEGRAM_TOKEN: z.string(),
    TELEGRAM_CHAT_ID: z.number(),
    TELEGRAM_CONTEST_MANAGEMENT_THREAD_ID: z.number(),
    CONTEST_CREATION_WEBHOOK_SECRET: z.string(),
    TNOODLE_URL:
      process.env.NEXT_PUBLIC_APP_ENV === 'development'
        ? z.string().url().optional()
        : z.string().url(),
    TNOODLE_SECRET:
      process.env.NEXT_PUBLIC_APP_ENV === 'development'
        ? z.string().optional()
        : z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
    NEXT_PUBLIC_POSTHOG_KEY:
      process.env.NEXT_PUBLIC_APP_ENV === 'production'
        ? z.string()
        : z.undefined(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    GH_DOKPLOY_WEBHOOK_URL: process.env.DOKPLOY_WEBHOOK_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
    AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    AUTH_GOOGLE_URL: process.env.AUTH_GOOGLE_URL,
    AUTH_WCA_CLIENT_ID: process.env.AUTH_WCA_CLIENT_ID,
    AUTH_WCA_CLIENT_SECRET: process.env.AUTH_WCA_CLIENT_SECRET,
    AUTH_WCA_URL: process.env.AUTH_WCA_URL,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    TELEGRAM_CHAT_ID: Number(process.env.TELEGRAM_CHAT_ID),
    TELEGRAM_CONTEST_MANAGEMENT_THREAD_ID: Number(
      process.env.TELEGRAM_CONTEST_MANAGEMENT_THREAD_ID,
    ),
    CONTEST_CREATION_WEBHOOK_SECRET:
      process.env.CONTEST_CREATION_WEBHOOK_SECRET,
    TNOODLE_URL: process.env.TNOODLE_URL,
    TNOODLE_SECRET: process.env.TNOODLE_SECRET,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
