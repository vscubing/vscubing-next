'use client'

import { useEffect, useState } from 'react'
import { LayoutHeaderTitlePortal } from '../_layout'
import { useEventCallback, useEventListener } from 'usehooks-ts'
import { keyToMove } from '@vscubing/cubing/alg'
import { isMove, type Move } from '@/types'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from 'socket-server/types'
import { io, type Socket } from 'socket.io-client'
import { cn } from '@/frontend/utils/cn'
import { LoadingSpinner } from '@/frontend/ui'
import type { KPatternData } from '@vscubing/cubing/kpuzzle'
import { puzzles } from '@vscubing/cubing/puzzles'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'

export default function CubeTogetherPage() {
  const [patternData, setPatternData] = useState<KPatternData>()

  const [socket, setSocket] =
    useState<Socket<ServerToClientEvents, ClientToServerEvents>>()

  const applyMoveHandler = useEventCallback((move: Move) => {
    return applyMove(move)
  })

  useEffect(() => {
    const _socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      'ws://localhost:3001',
    )
    setSocket(_socket)

    _socket.on('pattern', (pattern) => setPatternData(pattern))
    _socket.on('onMove', applyMoveHandler)

    return () => {
      _socket.close()
    }
  }, [applyMoveHandler])

  const { simulatorRef, applyMove } = useControllableSimulator({
    discipline: '3by3',
    scramble: '',
    // patternData,
  })

  useEventListener('keydown', (e) => {
    void (async () => {
      if (!socket) return

      const keyMapping = await puzzles['3x3x3']?.keyMapping?.()
      if (!keyMapping) throw new Error('no puzzle')

      // TODO: sync keyToMove with cstimer mappings
      const move = keyToMove(keyMapping, e)?.toString()
      if (!move || !isMove(move)) return
      socket.emit('onMove', move)
    })()
  })

  return (
    <>
      <LayoutHeaderTitlePortal>Cube together</LayoutHeaderTitlePortal>
      <div className='relative flex flex-1 items-center justify-center rounded-2xl bg-black-80 p-4'>
        <div
          ref={simulatorRef}
          className={cn(
            'aspect-square h-[70%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem]',
            // { 'opacity-0': patternData === undefined },
          )}
        />
        <LoadingSpinner
          size='lg'
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0',
            // { 'opacity-100': patternData === undefined },
          )}
        />
      </div>
    </>
  )
}
