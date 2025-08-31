import { type Discipline, type SimulatorSettings } from '@/types'
import {
  type SimulatorCameraPosition,
  type TwistySimulatorMoveListener,
  type TwistySimulatorPuzzle,
} from 'vendor/cstimer/types'
import { initTwistySimulator } from 'vendor/cstimer'
import { type RefObject, useEffect, useState } from 'react'
import { useEventCallback } from 'usehooks-ts'
import { QuantumMove } from '@vscubing/cubing/alg'

export type SimulatorMoveListener = ({
  move,
  isRotation,
  isSolved,
}: {
  move: QuantumMove
  timestamp: number
  isRotation: boolean
  isSolved: boolean
}) => void
export function useTwistySimulator({
  // TODO: use useControllableSimulator instead?
  containerRef,
  onMove,
  scramble,
  discipline,
  settings,
  touchCubeEnabled,
  setCameraPosition,
  scale,
}: {
  containerRef: RefObject<HTMLElement | null>
  onMove: SimulatorMoveListener
  scramble: string | undefined
  discipline: Discipline
  settings: SimulatorSettings
  touchCubeEnabled: boolean
  setCameraPosition: (pos: SimulatorCameraPosition) => void
  scale: number
}) {
  const [puzzle, setPuzzle] = useState<TwistySimulatorPuzzle | undefined>()

  const stableSetCameraPosition = useEventCallback(setCameraPosition)

  useEffect(() => {
    let _puzzle: TwistySimulatorPuzzle | undefined // we need this because move2str is tightly coupled with Puzzle

    const moveListener: TwistySimulatorMoveListener = (rawMove, timestamp) => {
      if (!_puzzle) throw new Error('[SIMULATOR] puzzle undefined')

      const move = new QuantumMove(_puzzle.move2str(rawMove))
      const isSolved = _puzzle.isSolved() === 0
      onMove({
        move,
        timestamp,
        isRotation: _puzzle.isRotation(rawMove),
        isSolved,
      })
    }

    void initTwistySimulator(
      {
        puzzle: SIMULATOR_DISCIPLINES_MAP[discipline],
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
    onMove,
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
  }, [scale, puzzle])
}

const SIMULATOR_DISCIPLINES_MAP = {
  '3by3': 'cube3',
  '2by2': 'cube2',
  '4by4': 'cube4',
} as const
