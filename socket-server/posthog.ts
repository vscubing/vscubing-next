import { PostHog } from 'posthog-node'

const posthogKey = process.env.POSTHOG_KEY ?? 'DISABLED'

export const posthog = new PostHog(posthogKey, {
  host: 'https://eu.i.posthog.com',
  flushAt: 1,
  flushInterval: 0,
  disabled: posthogKey === 'DISABLED',
})

// Event types for cube-together
export type CubeTogetherEvent =
  | 'cube_together_room_created'
  | 'cube_together_room_joined'
  | 'cube_together_room_left'
  | 'cube_together_room_deleted'
  | 'cube_together_move_made'

export function trackEvent(
  event: CubeTogetherEvent,
  distinctId: string,
  properties?: Record<string, unknown>,
) {
  posthog.capture({
    distinctId,
    event,
    properties,
  })
}
