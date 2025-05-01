'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePresenceChannel } from '@/lib/pusher/pusher-client'
import { type SolveStream } from '@/lib/pusher/streams'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import type { Discipline } from '@/types'
import { type TwistySimulatorPuzzle, initTwistySimulator } from 'vendor/cstimer'
import { SIMULATOR_DISCIPLINES_MAP } from '../../solve/_components/simulator/components/simulator/use-simulator'
import { useTRPC } from '@/lib/trpc/react'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout'
import { LoadingSpinner } from '@/frontend/ui'
import { EyeIcon } from 'lucide-react'
import { useEventCallback } from 'usehooks-ts'
import { useResizeObserver } from '@/frontend/utils/use-resize-observer'

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
        setTimeout(
          () =>
            setStreams((prev) =>
              prev.filter((stream) => stream.streamId !== streamId),
            ),
          5000,
        ),
    }),
    [],
  )
  const { membersCount, isSubscribed } = usePresenceChannel(
    'presence-solve-streams',
    bindings,
  )

  return (
    <>
      <LayoutHeaderTitlePortal>
        <span className='flex items-center'>
          <span>WatchLivePage</span>
          {isSubscribed ? (
            <>
              <span className='ml-2 h-4 w-4 animate-pulse rounded-full bg-red-100' />
              <span className='ml-4 flex gap-2 rounded-2xl bg-black-80'>
                <EyeIcon />
                <span className='text-large'>{membersCount}</span>
              </span>
            </>
          ) : (
            <LoadingSpinner size='sm' />
          )}
        </span>
      </LayoutHeaderTitlePortal>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2'>
        {streams.map((stream) => (
          <SolveStreamView stream={stream} key={stream.streamId} />
        ))}
      </div>
    </>
  )
}

function SolveStreamView({
  stream: { discipline, scramble, streamId },
}: {
  stream: SolveStream
}) {
  const { initialMoves, enabled } = useSolveStream({
    streamId,
    onMove: (move) => applyMove(move), // TODO: handle long puzzle loading
  })

  const { simulatorRef, applyMove } = useControllableSimulator({
    discipline,
    scramble: initialMoves ? scramble + ' ' + initialMoves.join(' ') : '',
    enabled,
  })

  if (!enabled)
    return (
      <div className='flex aspect-square items-center justify-center rounded-2xl bg-black-80'>
        <LoadingSpinner />
      </div>
    )

  return (
    <div
      ref={simulatorRef}
      className='flex aspect-square w-full flex-1 items-center justify-center rounded-2xl bg-black-80 p-4'
    ></div>
  )
}

function useControllableSimulator({
  discipline,
  scramble,
  enabled,
}: {
  discipline: Discipline
  scramble: string
  enabled: boolean
}) {
  const simulatorRef = useRef<HTMLDivElement>(null)
  const [puzzle, setPuzzle] = useState<TwistySimulatorPuzzle | undefined>()

  useEffect(() => {
    const simulatorElem = simulatorRef.current
    if (!simulatorElem || !enabled) return

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
      simulatorElem,
    ).then((pzl) => {
      setTimeout(() => {
        pzl.resize()
        pzl.setCameraPosition({ phi: 6, theta: 0 })
      })
      setPuzzle(pzl)
      pzl?.applyMoves(parseMoves(scramble, pzl), 0, true)
    })
    return () => {
      setPuzzle(undefined)
      simulatorElem.innerHTML = ''
    }
  }, [simulatorRef, discipline, scramble, enabled])

  const applyMove = useEventCallback((move: string) => {
    if (!puzzle) throw new Error('no puzzle!')
    puzzle.addMoves(parseMoves(move, puzzle), 0)
  })

  useResizeObserver({
    ref: simulatorRef,
    onResize: () => {
      puzzle?.resize()
      puzzle?.setCameraPosition({ phi: 6, theta: 0 })
    },
  })

  return { applyMove, simulatorRef }
}

function useSolveStream({
  streamId,
  onMove,
}: {
  streamId: string
  onMove: (move: string) => void
}) {
  const stableMoveHandler = useEventCallback(
    (move: { move: string; idx: number }) => moveHandler(move),
  )
  const bindings = useMemo(
    () => ({ move: stableMoveHandler }),
    [stableMoveHandler],
  )
  const { isSubscribed } = usePresenceChannel(
    `presence-solve-stream-${streamId}`,
    bindings,
  )

  const trpc = useTRPC()
  const { data: fetchedInitialMoves } = useQuery({
    ...trpc.solveStream.getStreamMoves.queryOptions({ streamId }),
    enabled: isSubscribed, // NOTE: we fetch initialMoves only after the stream connection is established so that no moves are lost in-between
  })

  // NOTE: we buffer the moves from the stream until initialMoves are loaded
  const [bufferedMoves, setBufferedMoves] = useState<
    {
      move: string
      idx: number
    }[]
  >([])

  function moveHandler({ move, idx }: { move: string; idx: number }) {
    if (fetchedInitialMoves) {
      onMove(move)
      return
    }

    setBufferedMoves((prev) => [...prev, { move, idx }])
  }

  if (fetchedInitialMoves === undefined)
    return { initialMoves: undefined, enabled: false }

  // NOTE: if moves happen after the stream connection is established, but before a snapshot of initialMoves is made, there will be an overlap between initialMoves and bufferedMoves so we have to dedup
  const bufferedMovesWithoutOverlap = bufferedMoves.filter(
    ({ idx }) => idx > fetchedInitialMoves.length - 1,
  )
  return {
    initialMoves: fetchedInitialMoves.concat(
      bufferedMovesWithoutOverlap.map(({ move }) => move),
    ),
    enabled: !!fetchedInitialMoves,
  }
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
