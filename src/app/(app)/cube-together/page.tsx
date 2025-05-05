'use client'

import { useEffect, useState } from 'react'
import { LayoutHeaderTitlePortal } from '../_layout'
import { useEventCallback, useEventListener } from 'usehooks-ts'
import { keyToMove } from '@vscubing/cubing/alg'
import { isMove } from '@/types'
import { cn } from '@/frontend/utils/cn'
import { LoadingSpinner } from '@/frontend/ui'
import { puzzles } from '@vscubing/cubing/puzzles'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { z, ZodIssueCode } from 'zod'
import { assertUnreachable } from '@/lib/utils/assert-unreachable'
import { KPattern } from '@vscubing/cubing/kpuzzle'
import { useUser } from '@/frontend/shared/use-user'

export default function CubeTogetherPage() {
  const { pattern, onMove } = useCubeTogetherWebsocket({
    handleMove: (move) => applyMove(move),
  })

  const { simulatorRef, applyMove } = useControllableSimulator({
    discipline: '3by3',
    pattern,
  })

  useEventListener('keydown', (e) => {
    async function handle() {
      const keyMapping = await puzzles['3x3x3']!.keyMapping!()

      // TODO: sync keyToMove with cstimer mappings
      const move = keyToMove(keyMapping, e)?.toString()
      if (!move || !isMove(move)) return
      onMove(move)
    }
    void handle()
  })

  return (
    <>
      <LayoutHeaderTitlePortal>Cube together</LayoutHeaderTitlePortal>
      <div className='relative flex flex-1 items-center justify-center rounded-2xl bg-black-80 p-4'>
        <div
          ref={simulatorRef}
          className={cn(
            'aspect-square h-[70%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem]',
            { 'opacity-0': pattern === undefined },
          )}
        />
        <LoadingSpinner
          size='lg'
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0',
            { 'opacity-100': pattern === undefined },
          )}
        />
      </div>
    </>
  )
}

function parseJsonPreprocessor(value: unknown, ctx: z.RefinementCtx) {
  if (typeof value !== 'string') {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'Not a string',
    })
    return
  }
  try {
    return JSON.parse(value) as unknown
  } catch (e) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: (e as Error).message,
    })
  }
}

function useCubeTogetherWebsocket({
  handleMove,
}: {
  handleMove: (move: string) => void
}) {
  const [pattern, setPattern] = useState<KPattern>()
  const [socket, setSocket] = useState<WebSocket>()
  const { user } = useUser()
  const [identifier, setIdentifier] = useState<string>()

  if (user !== undefined && identifier === undefined) {
    setIdentifier(user?.name ?? 'guest-' + Math.random().toFixed(5))
  }

  function onMove(move: string) {
    socket?.send(
      JSON.stringify({ type: 'move', payload: { move, username: identifier } }),
    )
  }

  const stableHandleMove = useEventCallback(handleMove)

  useEffect(() => {
    if (!identifier) return

    const _socket = new WebSocket('ws://localhost:8787/ws')

    _socket.addEventListener(
      'message',
      (message) => void handleMessage(message),
    )
    setSocket(_socket)

    async function handleMessage(event: MessageEvent<unknown>) {
      const data = z
        .preprocess(
          parseJsonPreprocessor,
          z.union([patternMessageSchema, moveMessageSchema]),
        )
        .parse(event.data)
      switch (data.type) {
        case 'pattern': {
          const puzzle = await puzzles['3x3x3']!.kpuzzle()
          setPattern(new KPattern(puzzle, data.payload))
          break
        }
        case 'move': {
          stableHandleMove(data.payload)
          break
        }
        default:
          assertUnreachable(data)
      }
    }
    return () => _socket.close()
  }, [stableHandleMove, identifier])

  return { pattern, onMove }
}

const kpuzzleDataSchema = z.record(
  z.string(),
  z.object({
    pieces: z.array(z.number()),
    orientation: z.array(z.number()),
  }),
)
const patternMessageSchema = z.object({
  type: z.literal('pattern'),
  payload: kpuzzleDataSchema,
})
const moveMessageSchema = z.object({
  type: z.literal('move'),
  payload: z.string(),
})
