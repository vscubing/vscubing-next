'use client'

import { useEffect, useState } from 'react'
import { type PresenceChannel } from 'pusher-js'
import { Input, PrimaryButton } from '@/frontend/ui'
import { testAction } from './pusher-actions'
import { getPusherClient } from '@/lib/pusher/pusher-client'
import { z } from 'zod'

export default function WatchLivePage() {
  const [channelName, setChannelName] = useState<string>('')
  const { me, membersCount, messages, isSubscribed, unsubscribe, sendMessage } =
    usePresenceChannel(channelName)

  return (
    <div>
      <h1 className='title-h1'>WatchLivePage</h1>
      <p>subscribed: {JSON.stringify(isSubscribed)}</p>
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
        disabled={!isSubscribed}
        onClick={() => sendMessage(String(Math.random()))}
      >
        Trigger
      </PrimaryButton>
      <PrimaryButton disabled={!isSubscribed} onClick={() => unsubscribe()}>
        Unsubscribe
      </PrimaryButton>
    </div>
  )
}

function usePresenceChannel(unprefixedChannelName: string) {
  const channelName = `presence-${unprefixedChannelName}`

  const [messages, setMessages] = useState<string[]>([])
  const [membersCount, setMembersCount] = useState(-1)
  const [me, setMe] = useState<string>('')

  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (channelName === 'presence-') return

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

    channel.bind('message', (data: string) =>
      setMessages((prev) => [...prev, data]),
    )
    return () => {
      pusherClient.unsubscribe(channel.name)
      setIsSubscribed(false)
      setMessages([])
    }
  }, [channelName])

  function unsubscribe() {
    const pusherClient = getPusherClient()
    pusherClient.unsubscribe(channelName)
    setIsSubscribed(false)
    setMessages([])
  }

  function sendMessage(message: string) {
    void testAction(channelName, message)
  }

  return { isSubscribed, unsubscribe, me, membersCount, messages, sendMessage }
}
