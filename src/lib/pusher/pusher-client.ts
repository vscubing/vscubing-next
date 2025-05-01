import PusherJS, { type PresenceChannel } from 'pusher-js'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
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
  const [me, setMe] = useState<string>('')

  const [isSubscribed, setIsSubscribed] = useState(false)

  // HACK: we don't want bindings to ever affect the socket connection so we "stabilize" them, see https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
  const stableBindings = useRef(bindings)
  useLayoutEffect(() => {
    stableBindings.current = bindings
  })

  useEffect(() => {
    console.log('subscribing...')
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

    for (const [eventName, callback] of Object.entries(
      stableBindings.current,
    )) {
      channel.bind(eventName, callback)
    }
    return () => {
      pusherClient.unsubscribe(channel.name)
      for (const eventName of Object.keys(stableBindings.current)) {
        channel.unbind(eventName)
      }
      setIsSubscribed(false)
    }
  }, [channelName, stableBindings])

  function unsubscribe() {
    const pusherClient = getPusherClient()
    pusherClient.unsubscribe(channelName)
    setIsSubscribed(false)
  }

  return { isSubscribed, unsubscribe, me, membersCount }
}
