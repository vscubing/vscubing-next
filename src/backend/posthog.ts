import { env } from '@/env'
import { PostHog } from 'posthog-node'

export const posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
  host: 'https://eu.i.posthog.com',
  flushAt: 1,
  flushInterval: 0,
  disabled: env.NEXT_PUBLIC_POSTHOG_KEY === 'DISABLED',
  persistence: 'memory',
})
