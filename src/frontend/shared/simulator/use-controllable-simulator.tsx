import { useIsTouchDevice } from '@/frontend/utils/use-media-query'
import { useResizeObserver } from '@/frontend/utils/use-resize-observer'
import type { Discipline, SimulatorSettings } from '@/types'
import type { KPattern } from '@vscubing/cubing/kpuzzle'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useEventCallback } from 'usehooks-ts'
import { initTwistySimulator } from 'vendor/cstimer'
import type {
  SimulatorCameraPosition,
  TwistySimulatorPuzzle,
} from 'vendor/cstimer/types'

const CAMERA_POSITION_DEFAULTS = { phi: 6, theta: 0 } as const

export function useControllableSimulator({
  discipline,
  scramble,
  settings,
  setCameraPosition,
  pattern,
}: {
  discipline: Discipline
  settings?: Partial<
    Pick<
      SimulatorSettings,
      | 'animationDuration'
      | 'cameraPositionPhi'
      | 'cameraPositionTheta'
      | 'colorscheme'
    >
  >
  scramble?: string
  setCameraPosition?: (pos: SimulatorCameraPosition) => void
  pattern?: KPattern
}) {
  const simulatorRef = useRef<HTMLDivElement>(null)
  const [puzzle, setPuzzle] = useState<TwistySimulatorPuzzle | undefined>()

  const memoizedSettings = useMemo(
    () => ({
      animationDuration: settings?.animationDuration,
      colorscheme: settings?.colorscheme,
    }),
    [settings?.animationDuration, settings?.colorscheme],
  )
  const stableSetCameraPosition = useEventCallback(setCameraPosition)

  const cameraPosition = useMemo(
    () => ({
      phi: settings?.cameraPositionPhi ?? CAMERA_POSITION_DEFAULTS.phi,
      theta: settings?.cameraPositionTheta ?? CAMERA_POSITION_DEFAULTS.theta,
    }),
    [settings?.cameraPositionPhi, settings?.cameraPositionTheta],
  )

  const isTouchDevice = useIsTouchDevice()
  useEffect(() => {
    const simulatorElem = simulatorRef.current
    if (!simulatorElem || (scramble === undefined && pattern === undefined))
      return

    void initTwistySimulator(
      {
        puzzle: SIMULATOR_DISCIPLINES_MAP[discipline].puzzle,
        animationDuration: memoizedSettings.animationDuration ?? 100,
        allowDragging: isTouchDevice ?? false,
        colorscheme: memoizedSettings.colorscheme,
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      stableSetCameraPosition ?? (() => {}),
      simulatorElem,
    ).then(async (pzl) => {
      setTimeout(() => pzl.resize())
      setPuzzle(pzl)

      if (scramble) {
        const fixedScr =
          scramble.trim() === '' ? "y y'" : fixDoublePrimeMoves(scramble) // HACK: applyMoves misbehaves on empty string so we replace it with y y' which is equivalent of not applying any moves (should we move this inside `vendor/cstimer`?)
        pzl?.applyMoves(tranformAlgForCstimer(fixedScr, pzl), 0, true)
      } else if (pattern) pzl.applyPattern(pattern.patternData)
    })
    return () => {
      setPuzzle(undefined)
      simulatorElem.innerHTML = ''
    }
  }, [
    simulatorRef,
    discipline,
    scramble,
    pattern,
    memoizedSettings,
    isTouchDevice,
    stableSetCameraPosition,
  ])

  const applyMove = useEventCallback((move: string) => {
    if (puzzle) puzzle.addMoves(tranformAlgForCstimer(move, puzzle))
  })

  const applyKeyboardMove = useEventCallback((event: KeyboardEvent) => {
    if (puzzle) puzzle.keydown(event)
  })

  useResizeObserver({
    ref: simulatorRef,
    onResize: () => {
      puzzle?.resize()
      puzzle?.setCameraPosition(cameraPosition)
    },
  })

  useEffect(() => {
    if (puzzle) setTimeout(() => puzzle.setCameraPosition(cameraPosition))
  }, [cameraPosition, puzzle, scramble])

  return { applyMove, simulatorRef, applyKeyboardMove, puzzle }
}

const SIMULATOR_DISCIPLINES_MAP = {
  '3by3': {
    dimension: 3,
    puzzle: 'cube3',
  },
  '2by2': {
    dimension: 2,
    puzzle: 'cube2',
  },
} as const

// HACK: twisty simulator doesn't support double prime moves like z2' that `cubing.js`'s .invert() outputs a lot
function fixDoublePrimeMoves(alg: string): string {
  return alg.replaceAll("2'", '2')
}

function tranformAlgForCstimer(alg: string, puzzle: TwistySimulatorPuzzle) {
  const res = alg
    .trim()
    .split(' ')
    .map((move) => {
      if (move in CSTIMER_REPLACE_MAP)
        return CSTIMER_REPLACE_MAP[move as keyof typeof CSTIMER_REPLACE_MAP]
      else return puzzle.parseScramble(move)[0]
    })
  return res
}

const CSTIMER_REPLACE_MAP = {
  E: [2, 2, 'U', -1],
  "E'": [2, 2, 'U', 1],
  M: [2, 2, 'L', 1],
  "M'": [2, 2, 'L', -1],
  S: [2, 2, 'F', 1],
  "S'": [2, 2, 'F', -1],
} as const
