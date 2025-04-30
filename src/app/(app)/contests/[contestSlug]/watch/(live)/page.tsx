'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePresenceChannel } from '@/lib/pusher/pusher-client'
import { type SolveStream } from '@/lib/pusher/streams'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Discipline } from '@/types'
import { type TwistySimulatorPuzzle, initTwistySimulator } from 'vendor/cstimer'
import { SIMULATOR_DISCIPLINES_MAP } from '../../solve/_components/simulator/components/simulator/use-simulator'
import { useTRPC } from '@/lib/trpc/react'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout'

export default function WatchLivePageContent() {
  const trpc = useTRPC()
  const { data: initialStreams } = useSuspenseQuery(
    trpc.solveStream.getActiveStreams.queryOptions(),
  )
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
    <>
      {/* <div className='flex-1 rounded-2xl bg-black-80 p-4'> */}
      <LayoutHeaderTitlePortal>
        WatchLivePage {isSubscribed ? '(connected)' : '(not connected)'}
      </LayoutHeaderTitlePortal>
      {/* <p>Watching live: {membersCount}</p> */}
      {/* <p>me: {me}</p> */}
      <div className='grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2'>
        {streams.map((stream) => (
          <SolveStreamView key={stream.streamId} stream={stream} />
        ))}
      </div>
      {/* </div> */}
    </>
  )
}

function SolveStreamView({
  stream: { discipline, scramble, streamId },
}: {
  stream: SolveStream
}) {
  const trpc = useTRPC()
  const { data: initialMoves } = useSuspenseQuery(
    trpc.solveStream.getStreamMoves.queryOptions({ streamId }),
  )
  const { containerRef: simulatorRef, applyMove } = useLiveStreamSimulator({
    discipline,
    scramble: scramble + ' ' + initialMoves.join(' '),
  })
  const applyMoveStable = useEventCallback(applyMove)

  const bindings = useMemo(
    () => ({
      move: (move: string) => applyMoveStable(move),
    }),
    [applyMoveStable],
  )
  const { isSubscribed } = usePresenceChannel(
    `presence-solve-stream-${streamId}`,
    bindings,
  )

  return (
    <div>
      {/* <p> */}
      {/*   {streamId}, {discipline}, {scramble}, isSubscribed:{' '} */}
      {/*   {JSON.stringify(isSubscribed)} */}
      {/* </p> */}
      {/* <p>{initialMoves}</p> */}
      <div className='flex flex-1 items-center justify-center rounded-2xl bg-black-80 p-4'>
        <div ref={simulatorRef} className='aspect-square w-full'></div>
      </div>
    </div>
  )
}

function useLiveStreamSimulator({
  discipline,
  scramble,
}: {
  discipline: Discipline
  scramble: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [puzzle, setPuzzle] = useState<TwistySimulatorPuzzle | undefined>()

  useEffect(() => {
    void initTwistySimulator(
      {
        puzzle: SIMULATOR_DISCIPLINES_MAP[discipline].puzzle,
        animationDuration: 20,
        allowDragging: false,
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      containerRef.current!,
    ).then((pzl) => {
      setTimeout(() => {
        pzl.resize()
        pzl.setCameraPosition({ phi: 6, theta: 0 })
      })
      setPuzzle(pzl)
      pzl?.applyMoves(pzl.parseScramble(scramble), 0, true)
    })
    return () => setPuzzle(undefined)
  }, [containerRef, discipline, scramble])

  const applyMove = useCallback(
    (move: string) => {
      if (!puzzle) throw new Error('no puzzle!')
      puzzle.addMoves(puzzle.parseScramble(move), 0)
    },
    [puzzle],
  )
  return { applyMove, containerRef }
}

type Fn<ARGS extends unknown[], R> = (...args: ARGS) => R

const useEventCallback = <A extends unknown[], R>(fn: Fn<A, R>): Fn<A, R> => {
  const ref = useRef<Fn<A, R>>(fn)
  useLayoutEffect(() => {
    ref.current = fn
  })
  return useMemo(
    () =>
      (...args: A): R => {
        const { current } = ref
        return current(...args)
      },
    [],
  )
}
