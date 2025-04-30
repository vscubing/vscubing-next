'use client'

import React, { useEffect, useRef, useState } from 'react'
import PusherJS, { type Channel, type PresenceChannel } from 'pusher-js'
import { Input, PrimaryButton } from '@/frontend/ui'
import { testAction } from './pusher-actions'

export default function WatchLivePage() {
  const [messages, setMessages] = useState<string[]>([])
  const [channelName, setChannelName] = useState<string>('presence-')
  const [membersCount, setMembersCount] = useState(-1)
  const [me, setMe] = useState<string>('')

  const [subscribed, setSubscribed] = useState(false)
  const channelRef = useRef<Channel>(null)

  useEffect(() => {
    if (channelName === '') return
    const pusherClient = getPusherClient()

    const channel = pusherClient.subscribe(channelName) as PresenceChannel

    channel.bind('pusher:subscription_succeeded', () => {
      setMembersCount(channel.members.count)
      setMe(channel.members.me.info.name)
      setSubscribed(true)
    })

    channel.bind('pusher:member_removed', () => {
      setMembersCount(channel.members.count)
    })

    channel.bind('pusher:member_added', () => {
      setMembersCount(channel.members.count)
    })

    channelRef.current = channel

    channel.bind('message', (data: string) =>
      setMessages((prev) => [...prev, data]),
    )
    return () => {
      pusherClient.unsubscribe(channel.name)
      setSubscribed(false)
      setMessages([])
    }
  }, [channelName])

  return (
    <div>
      <h1 className='title-h1'>WatchLivePage</h1>
      <p>subscribed: {JSON.stringify(subscribed)}</p>
      <p>members: {membersCount}</p>
      <p>me: {me}</p>
      <Input
        value={channelName}
        className='border border-white-100'
        onChange={(e) => setChannelName(e.target.value)}
      />
      <p>List:</p>
      {messages.map((msg, idx) => (
        <p key={idx}>{msg}</p>
      ))}
      <PrimaryButton
        disabled={!subscribed}
        onClick={() => void testAction(channelName, String(Math.random()))}
      >
        Trigger
      </PrimaryButton>
      <PrimaryButton
        disabled={!subscribed}
        onClick={() => {
          getPusherClient().unsubscribe(channelRef.current!.name)
          setSubscribed(false)
          setMembersCount(-1)
        }}
      >
        Unsubscribe
      </PrimaryButton>
    </div>
  )
}

let pusherSingleton: PusherJS | undefined
function getPusherClient() {
  // PusherJS.logToConsole = true

  if (!pusherSingleton) {
    pusherSingleton = new PusherJS('app-key', {
      cluster: 'NOT_USED',
      wsHost: '127.0.0.1',
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/api/pusher/auth-channel',
      userAuthentication: {
        endpoint: '/api/pusher/auth-user',
        transport: 'ajax',
      },
    })
  }
  return pusherSingleton
}
