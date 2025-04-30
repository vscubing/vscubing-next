'use client'

import { useMemo, useState } from 'react'
import { usePresenceChannel } from '@/lib/pusher/pusher-client'
import { type SolveStream } from '@/lib/pusher/streams'

export default function WatchLivePage() {
  const [streams, setStreams] = useState<SolveStream[]>([])

  const bindings = useMemo(
    () => ({
      created: (stream: SolveStream) => setStreams((prev) => [...prev, stream]),
    }),
    [],
  )
  const { me, membersCount, isSubscribed } = usePresenceChannel(
    'presence-solve-streams',
    bindings,
  )

  return (
    <div>
      <h1 className='title-h1'>WatchLivePage</h1>
      <p>subscribed: {JSON.stringify(isSubscribed)}</p>
      <p>members: {membersCount}</p>
      <p>me: {me}</p>
      {streams.length > 0 && <h2>Streams:</h2>}
      {streams.map((stream) => (
        <SolveStremView key={stream.streamId} stream={stream} />
      ))}
    </div>
  )
}

function SolveStremView({
  stream: { discipline, scramble, streamId },
}: {
  stream: SolveStream
}) {
  const [moves, setMoves] = useState<string[]>([])
  const bindings = useMemo(
    () => ({
      move: (move: string) => setMoves((prev) => [...prev, move]),
    }),
    [],
  )
  const { isSubscribed } = usePresenceChannel(
    `presence-solve-stream-${streamId}`,
    bindings,
  )

  return (
    <div>
      <p>
        {streamId}, {discipline}, {scramble}, isSubscribed:{' '}
        {JSON.stringify(isSubscribed)}
      </p>
      <p>moves: {moves.join(' ')}</p>
    </div>
  )
}
