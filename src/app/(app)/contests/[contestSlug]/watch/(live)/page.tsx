'use client'

import {
  Suspense,
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
import { LoadingSpinner } from '@/frontend/ui'

export default function WatchLivePageContent() {
  const trpc = useTRPC()
  const { data: initialStreams } = useSuspenseQuery(
    trpc.solveStream.getActiveStreams.queryOptions(),
  )
  const [streams, setStreams] = useState<SolveStream[]>(initialStreams)

  const bindings = useMemo(
    () => ({
      created: (stream: SolveStream) => setStreams((prev) => [...prev, stream]),
      deleted: ({ streamId }: { streamId: string }) =>
        setStreams((prev) =>
          prev.filter((stream) => stream.streamId !== streamId),
        ),
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
      <div className='grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2'>
        {/* {Array.from({ length: 5 }).map((_, idx) => ( */}
        {/*   <div */}
        {/*     key={idx} */}
        {/*     className='flex aspect-square flex-1 items-center justify-center rounded-2xl bg-black-80 p-4' */}
        {/*   /> */}
        {/* ))} */}
        {streams.map((stream) => (
          <Suspense
            key={stream.streamId}
            fallback={
              <div className='flex items-center justify-center rounded-2xl bg-black-80'>
                <LoadingSpinner />
              </div>
            }
          >
            <SolveStreamView stream={stream} />
          </Suspense>
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
  const {
    containerRef: simulatorRef,
    applyMove,
    resize,
  } = useLiveStreamSimulator({
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
  usePresenceChannel(`presence-solve-stream-${streamId}`, bindings)

  const resizeStable = useEventCallback(resize)
  useEffect(() => {
    const node = simulatorRef.current
    if (!node) return

    const observer = new ResizeObserver(() => {
      resizeStable()
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [simulatorRef, resizeStable])

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
        animationDuration: 100,
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
      pzl?.applyMoves(parseMoves(scramble, pzl), 0, true)
    })
    return () => setPuzzle(undefined)
  }, [containerRef, discipline, scramble])

  const applyMove = useCallback(
    (move: string) => {
      if (!puzzle) throw new Error('no puzzle!')
      puzzle.addMoves(parseMoves(move, puzzle), 0)
    },
    [puzzle],
  )

  const resize = useCallback(() => {
    puzzle?.resize()
    puzzle?.setCameraPosition({ phi: 6, theta: 0 })
  }, [puzzle])
  return { applyMove, containerRef, resize }
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

function parseMoves(moves: string, puzzle: TwistySimulatorPuzzle) {
  const res = moves
    .trim()
    .split(' ')
    .map((move) => {
      if (move in REPLACE_MAP)
        return REPLACE_MAP[move as keyof typeof REPLACE_MAP]
      else return puzzle.parseScramble(move)[0]
    })
  return res
}

const REPLACE_MAP = {
  E: [2, 2, 'U', -1],
  "E'": [2, 2, 'U', 1],
  M: [2, 2, 'L', 1],
  "M'": [2, 2, 'L', -1],
  S: [2, 2, 'F', 1],
  "S'": [2, 2, 'F', -1],
} as const
