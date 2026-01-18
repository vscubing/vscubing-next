import {
  isMove,
  type Discipline,
  type Move,
  type SimulatorSettings,
} from '@/types'
import {
  type SimulatorCameraPosition,
  type TwistySimulatorMoveListener,
  type TwistySimulatorPuzzle,
} from 'vendor/cstimer/types'
import { initTwistySimulator } from 'vendor/cstimer'
import { type RefObject, useEffect, useState } from 'react'
import { useEventCallback } from 'usehooks-ts'
import { QuantumMove } from '@vscubing/cubing/alg'

export type SimulatorEvent = {
  move: QuantumMove
  timestamp: number
  isRotation: boolean
  isSolved: boolean
}

export function useTwistySimulator({
  // TODO: use useControllableSimulator instead?
  containerRef,
  onMove,
  scramble,
  discipline,
  settings,
  touchCubeEnabled,
  setCameraPosition,
}: {
  containerRef: RefObject<HTMLElement | null>
  onMove: (event: SimulatorEvent) => void
  scramble: string | undefined
  discipline: Discipline
  settings: SimulatorSettings
  touchCubeEnabled: boolean
  setCameraPosition: (pos: SimulatorCameraPosition) => void
}) {
  const stableOnMove = useEventCallback(onMove)
  const [puzzle, setPuzzle] = useState<TwistySimulatorPuzzle | undefined>()

  const stableSetCameraPosition = useEventCallback(setCameraPosition)

  useEffect(() => {
    let _puzzle: TwistySimulatorPuzzle | undefined // we need this because move2str is tightly coupled with Puzzle

    const moveListener: TwistySimulatorMoveListener = (rawMove, timestamp) => {
      if (!_puzzle) throw new Error('[SIMULATOR] puzzle undefined')

      const move = new QuantumMove(_puzzle.move2str(rawMove))
      const isSolved = _puzzle.isSolved() === 0
      stableOnMove({
        move,
        timestamp,
        isRotation: _puzzle.isRotation(rawMove),
        isSolved,
      })
    }

    void initTwistySimulator(
      {
        puzzle: SIMULATOR_DISCIPLINES_MAP[discipline].puzzle,
        animationDuration: settings.animationDuration,
        colorscheme: settings.colorscheme,
        allowDragging: touchCubeEnabled,
      },
      moveListener,
      stableSetCameraPosition,
      containerRef.current!,
    ).then((pzl) => {
      setTimeout(() => pzl.resize())
      _puzzle = pzl
      setPuzzle(pzl)
    })
  }, [
    settings.animationDuration,
    settings.colorscheme,
    containerRef,
    discipline,
    stableOnMove,
    touchCubeEnabled,
    stableSetCameraPosition,
  ])

  useEffect(() => {
    const abortSignal = new AbortController()

    if (!puzzle) return

    if (scramble) {
      puzzle.applyMoves(puzzle.parseScramble(scramble), undefined, true)
    }
    window.addEventListener(
      'keydown',
      (e) => {
        const cameraAdjustment = e.key.startsWith('Arrow')
        if (!scramble && !cameraAdjustment) return
        puzzle.keydown(e)
      },
      abortSignal,
    )

    return () => abortSignal.abort()
  }, [scramble, puzzle])

  useEffect(() => {
    if (puzzle)
      setTimeout(() =>
        puzzle.setCameraPosition({
          theta: settings.cameraPositionTheta,
          phi: settings.cameraPositionPhi,
        }),
      )
  }, [
    settings.cameraPositionTheta,
    settings.cameraPositionPhi,
    puzzle,
    scramble,
  ])

  useEffect(() => {
    puzzle?.resize()
  }, [settings.puzzleScale, puzzle])
}

export const SIMULATOR_DISCIPLINES_MAP = {
  '3by3': {
    dimension: 3,
    puzzle: 'cube3',
  },
  '2by2': {
    dimension: 2,
    puzzle: 'cube2',
  },
  '4by4': {
    dimension: 4,
    puzzle: 'cube4',
  },
} as const

function parseCstimerMove(moveCstimer: string): Move {
  const move = moveCstimer
    .replace(/@(\d+)/g, '/*$1*/')
    .replace(/2-2Rw2/g, 'M2')
    .replace(/2-2Lw|2-2Rw'/g, 'M')
    .replace(/2-2Rw/g, "M'")
    .replace(/2-2Fw/g, 'S')
    .replace(/2-2Uw'/g, 'E')
    .replace(/2-2Uw/g, "E'")
    .trim()

  if (!isMove(move)) throw new Error(`[SIMULATOR] invalid move: ${move}`)
  return move
}
