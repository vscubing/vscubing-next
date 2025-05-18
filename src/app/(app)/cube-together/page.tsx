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
import { type KPattern } from '@vscubing/cubing/kpuzzle'
import { useUser } from '@/frontend/shared/use-user'
import { io } from 'socket.io-client'
import type { SocketClient } from 'socket-server/types'
import { experimentalTwizzleBinaryToReid3x3x3 } from '@vscubing/cubing/protocol'

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

function useCubeTogetherWebsocket({
  handleMove,
}: {
  handleMove: (move: string) => void
}) {
  const [pattern, setPattern] = useState<KPattern>()
  const [socket, setSocket] = useState<SocketClient>()
  const { user } = useUser()
  const [identifier, setIdentifier] = useState<string>()

  if (user !== undefined && identifier === undefined) {
    setIdentifier(user?.name ?? 'guest-' + Math.random().toFixed(5))
  }

  function onMove(move: string) {
    if (!isMove(move)) throw new Error(`not a move? ${move}`)
    socket?.emit('onMove', move)
  }

  const stableHandleMove = useEventCallback(handleMove)

  useEffect(() => {
    if (!identifier) return

    const _socket: SocketClient = io('ws://localhost:3001')

    _socket.on('pattern', async (pattern) => {
      setPattern(experimentalTwizzleBinaryToReid3x3x3(pattern))
    })
    _socket.on('onMove', (move) => stableHandleMove(move))
    setSocket(_socket)

    return () => {
      _socket.close()
    }
  }, [stableHandleMove, identifier])

  return { pattern, onMove }
}
