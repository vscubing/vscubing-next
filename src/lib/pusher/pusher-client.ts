import PusherJS, { type PresenceChannel } from 'pusher-js'
import { useState, useEffect } from 'react'
import { z } from 'zod'

let pusherClientSingleton: PusherJS | undefined
function getPusherClient() {
  // PusherJS.logToConsole = true

  if (!pusherClientSingleton) {
    pusherClientSingleton = new PusherJS('app-key', {
      cluster: 'NOT_USED',
      wsHost: '127.0.0.1',
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/api/pusher/auth-channel',
    })
  }
  return pusherClientSingleton
}

export function usePresenceChannel(
  channelName: `presence-${string}`,
  bindings: Record<string, (data: never) => void>,
) {
  const [membersCount, setMembersCount] = useState<number | undefined>(
    undefined,
  )
  const [me, setMe] = useState<string | undefined>()

  const [isSubscribed, setIsSubscribed] = useState(false)

  // // TODO: figure out why bound callbacks don't "see" updated closure
  // const stableBindings = useRef(bindings)
  // useLayoutEffect(() => {
  //   stableBindings.current = {}
  //   for (const [eventName, callback] of Object.entries(bindings)) {
  //     stableBindings.current[eventName] = (...args) => callback(...args)
  //   }
  // })

  useEffect(() => {
    const pusherClient = getPusherClient()

    const channel = pusherClient.subscribe(channelName) as PresenceChannel

    channel.bind('pusher:subscription_succeeded', () => {
      setMembersCount(channel.members.count)
      const me = z
        .object({ id: z.string(), info: z.object({ name: z.string() }) })
        .parse(channel.members.me)
      setMe(me.info.name)
      setIsSubscribed(true)
    })

    channel.bind('pusher:member_removed', () => {
      setMembersCount(channel.members.count)
    })

    channel.bind('pusher:member_added', () => {
      setMembersCount(channel.members.count)
    })

    for (const [eventName, stableCallback] of Object.entries(bindings)) {
      channel.bind(eventName, stableCallback)
    }

    return () => {
      pusherClient.unsubscribe(channel.name)
      for (const eventName of Object.keys(bindings)) {
        channel.unbind(eventName)
      }
      setIsSubscribed(false)
    }
  }, [channelName, bindings])

  return { isSubscribed, me, membersCount }
}
