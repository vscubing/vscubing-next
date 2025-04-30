'use client'

import { useMemo, useState } from 'react'
import { Input, PrimaryButton } from '@/frontend/ui'
import { usePresenceChannel } from '@/lib/pusher/pusher-client'

export default function WatchLivePage() {
  const [channelName, setChannelName] = useState<string>('')
  const [messages, setMessages] = useState<string[]>([])

  const bindings = useMemo(
    () => ({
      message: (message: string) => setMessages((prev) => [...prev, message]),
    }),
    [],
  )

  const {
    me,
    membersCount,
    isSubscribed,
    unsubscribe: unsubscribeChannel,
    sendMessage,
  } = usePresenceChannel(channelName, bindings)

  function handleUnsubscribe() {
    unsubscribeChannel()
    setMessages([])
  }

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
      <PrimaryButton
        disabled={!isSubscribed}
        onClick={() => handleUnsubscribe()}
      >
        Unsubscribe
      </PrimaryButton>
    </div>
  )
}
