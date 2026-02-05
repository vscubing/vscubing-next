import { type Discipline, type SimulatorSettings } from '@/types'
import {
  type SimulatorCameraPosition,
  type TwistySimulatorMoveListener,
  type TwistySimulatorPuzzle,
} from 'vendor/cstimer/types'
import { initTwistySimulator } from 'vendor/cstimer'
import { type RefObject, useEffect, useState } from 'react'
import { useEventCallback, useEventListener } from 'usehooks-ts'
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

  useEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
        moveCameraDelta(1, 0)
        break
      case 'ArrowUp':
        moveCameraDelta(0, 1)
        break
      case 'ArrowRight':
        moveCameraDelta(-1, 0)
        break
      case 'ArrowDown':
        moveCameraDelta(0, -1)
        break
    }

    function moveCameraDelta(deltaTheta: number, deltaPhi: number) {
      let theta = settings.cameraPositionTheta + deltaTheta
      theta = Math.max(Math.min(theta, 6), -6)
      let phi = settings.cameraPositionPhi + deltaPhi
      phi = Math.max(Math.min(phi, 6), -6)
      setCameraPosition({ phi, theta })
    }
  })

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
        dimension: DISCIPLINE_DIMENSION_MAP[discipline],
        animationDuration: settings.animationDuration,
        colorscheme: settings.colorscheme,
        allowDragging: touchCubeEnabled,
      },
      moveListener,
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
        if (scramble) puzzle.keydown(e)
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

const DISCIPLINE_DIMENSION_MAP = {
  '3by3': 3,
  '2by2': 2,
  '4by4': 4,
} as const
