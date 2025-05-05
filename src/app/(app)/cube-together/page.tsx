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
import { TwistyCube } from '@/frontend/shared/twisty'
import { TwistyPlayer } from '@vscubing/cubing/twisty'

export default function CubeTogetherPage() {
  const [patternData, setPatternData] = useState<KPatternData>()
  const [history, setHistory] = useState<string>()

  const [socket, setSocket] =
    useState<Socket<ServerToClientEvents, ClientToServerEvents>>()

  const applyMoveHandler = useEventCallback((move: Move) => {
    // applyMove(move)
    setHistory((prev) => prev + ' ' + move)
  })

  const patternHandler = useEventCallback((pattern: KPatternData) => {
    if (
      !('CORNERS' in pattern) ||
      !('EDGES' in pattern) ||
      !('CENTERS' in pattern)
    )
      throw new Error('invalid pattern')

    puzzle?.applyPattern(pattern)
  })

  useEffect(() => {
    const _socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      'ws://localhost:3001',
    )
    setSocket(_socket)

    _socket.on('pattern', (newPatternData) => {
      patternHandler(newPatternData)
      setPatternData((prev) => {
        if (prev) {
          // console.clear()
          // logDiff('Edges', prev.EDGES!.pieces, newPatternData.EDGES!.pieces)
          // logDiff(
          //   'Edge pieces',
          //   prev.EDGES!.pieces,
          //   newPatternData.EDGES!.pieces,
          // )
          // logDiff(
          //   'Edge orientation',
          //   prev.EDGES!.orientation,
          //   newPatternData.EDGES!.orientation,
          // )
          // logDiff(
          //   'Centers',
          //   prev.CENTERS!.pieces,
          //   newPatternData.CENTERS!.pieces,
          // )
        }

        return newPatternData
      })
    })
    _socket.on('history', (h) => setHistory(h))
    _socket.on('onMove', applyMoveHandler)

    return () => {
      _socket.close()
    }
  }, [applyMoveHandler, patternHandler])

  const { simulatorRef, applyMove, puzzle } = useControllableSimulator({
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

  const [player, setPlayer] = useState<TwistyPlayer>()
  useEffect(() => {
    if (history !== undefined) {
      const newPlayer = new TwistyPlayer({
        controlPanel: 'none',
        background: 'none',
        visualization: 'PG3D',
        experimentalSetupAlg: history,
        alg: '',
        puzzle: '3x3x3',
      })
      setPlayer(newPlayer)
    } else {
      setPlayer(undefined)
    }
  }, [history])

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
        {player && (
          <TwistyCube player={player} className='h-[300px] w-[300px]' />
        )}
      </div>
    </>
  )
}

function logDiff(name: string, arr1: number[], arr2: number[]) {
  const changed = arr1.map((a, idx) => arr2[idx] !== a)
  console.log(
    name.padEnd(20),
    arr1
      .map((a, idx) => (changed[idx] ? String(a).padEnd(2, ' ') : '_ '))
      .join(' '),
  )
  console.log(
    name.padEnd(20),
    arr2
      .map((a, idx) => (changed[idx] ? String(a).padEnd(2, ' ') : '_ '))
      .join(' '),
  )
}
