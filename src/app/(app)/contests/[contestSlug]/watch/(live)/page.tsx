'use client'

import { useMemo, useState } from 'react'
import { usePresenceChannel } from '@/lib/pusher/pusher-client'
import { type SolveStream } from '@/lib/pusher/streams'
import { getActiveStreams, getStreamMoves } from '@/lib/pusher/pusher-actions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { NoSSR } from '@/frontend/utils/no-ssr'

export default function WatchLivePage() {
  return (
    <NoSSR>
      <WatchLivePageContent />
    </NoSSR>
  )
}

function WatchLivePageContent() {
  const { data: initialStreams } = useSuspenseQuery({
    queryFn: getActiveStreams,
    queryKey: ['active-streams'],
  })
  const [streams, setStreams] = useState<SolveStream[]>(initialStreams)

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
    <div className='flex-1 rounded-2xl bg-black-80 p-4'>
      <h1 className='title-h1'>WatchLivePage</h1>
      <p>subscribed: {JSON.stringify(isSubscribed)}</p>
      <p>Watching live: {membersCount}</p>
      <p>me: {me}</p>
      {streams.length > 0 && <h2>Streams:</h2>}
      <div className='space-y-2'>
        {streams.map((stream) => (
          <SolveStreamView key={stream.streamId} stream={stream} />
        ))}
      </div>
    </div>
  )
}

function SolveStreamView({
  stream: { discipline, scramble, streamId },
}: {
  stream: SolveStream
}) {
  const { data: initialMoves } = useSuspenseQuery({
    queryFn: () => getStreamMoves(streamId),
    queryKey: ['streams-moves'],
  })
  const [moves, setMoves] = useState<string[]>(initialMoves)
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
