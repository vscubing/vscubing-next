'use client'

import { useEffect, useState } from 'react'
import { LayoutHeaderTitlePortal } from '../_layout'
import { useEventCallback, useEventListener } from 'usehooks-ts'
import { keyToMove, type AlgLeaf, Move } from '@vscubing/cubing/alg'
import { isMove } from '@/types'
import { cn } from '@/frontend/utils/cn'
import { LoadingSpinner } from '@/frontend/ui'
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
    const move = keyToMove(cube3x3x3KeyMapping, e)?.toString()
    if (!move || !isMove(move)) return
    onMove(move)
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

const cube3x3x3KeyMapping: Record<number | string, AlgLeaf> = {
  Digit1: new Move("S'"),
  Digit2: new Move('E'),
  Digit5: new Move('M'),
  Digit6: new Move('M'),
  Digit9: new Move("E'"),
  Digit0: new Move('S'),

  KeyI: new Move('R'),
  KeyK: new Move("R'"),
  KeyW: new Move('B'),
  KeyO: new Move("B'"),
  KeyS: new Move('D'),
  KeyL: new Move("D'"),
  KeyD: new Move('L'),
  KeyE: new Move("L'"),
  KeyJ: new Move('U'),
  KeyF: new Move("U'"),
  KeyH: new Move('F'),
  KeyG: new Move("F'"),

  KeyC: new Move("Uw'"),
  KeyR: new Move("Lw'"),
  KeyU: new Move('Rw'),
  KeyM: new Move("Rw'"),

  KeyX: new Move("M'"),
  Comma: new Move('Uw'),

  KeyT: new Move('x'),
  KeyY: new Move('x'),
  KeyV: new Move('Lw'),
  KeyN: new Move("x'"),
  Semicolon: new Move('y'),
  KeyA: new Move("y'"),
  KeyP: new Move('z'),
  KeyQ: new Move("z'"),

  KeyZ: new Move('Dw'),
  KeyB: new Move("x'"),
  Period: new Move("M'"),
  Slash: new Move("Dw'"),
}
