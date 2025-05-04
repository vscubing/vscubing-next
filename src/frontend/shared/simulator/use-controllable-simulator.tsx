import { useResizeObserver } from '@/frontend/utils/use-resize-observer'
import type { Discipline, SimulatorSettings } from '@/types'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useEventCallback } from 'usehooks-ts'
import { initTwistySimulator } from 'vendor/cstimer'
import type { TwistySimulatorPuzzle } from 'vendor/cstimer/types'

export function useControllableSimulator({
  discipline,
  scramble,
  settings,
}: {
  discipline: Discipline
  settings?: Partial<SimulatorSettings>
  scramble: string
}) {
  const simulatorRef = useRef<HTMLDivElement>(null)
  const [puzzle, setPuzzle] = useState<TwistySimulatorPuzzle | undefined>()

  const memoizedSettings = useMemo(() => JSON.stringify(settings), [settings])

  useEffect(() => {
    const parsedSettings = JSON.parse(
      // TODO: fix this differently, this is a dirty hack
      memoizedSettings,
    ) as Partial<SimulatorSettings>

    const simulatorElem = simulatorRef.current
    if (!simulatorElem || scramble === undefined) return

    void initTwistySimulator(
      {
        puzzle: SIMULATOR_DISCIPLINES_MAP[discipline].puzzle,
        animationDuration: parsedSettings.animationDuration ?? 100,
        allowDragging: false,
        colorscheme: parsedSettings.colorscheme,
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      simulatorElem,
    ).then(async (pzl) => {
      setTimeout(() => {
        pzl.resize()
        pzl.setCameraPosition({ phi: 6, theta: 0 })
      })
      setPuzzle(pzl)

      const fixedScr =
        scramble.trim() === '' ? "y y'" : fixDoublePrimeMoves(scramble) // HACK: applyMoves misbehaves on empty string so we replace it with y y' which is equivalent of not applying any moves (should we move this inside `vendor/cstimer`?)
      pzl?.applyMoves(tranformAlgForCstimer(fixedScr, pzl), 0, true)
    })
    return () => {
      setPuzzle(undefined)
      simulatorElem.innerHTML = ''
    }
  }, [simulatorRef, discipline, scramble, memoizedSettings])

  const applyMove = useEventCallback((move: string) => {
    if (!puzzle) throw new Error('no puzzle!')
    puzzle.addMoves(tranformAlgForCstimer(move, puzzle))
  })

  const applyKeyboardMove = useEventCallback((event: KeyboardEvent) => {
    if (!puzzle) throw new Error('no puzzle!')
    puzzle.keydown(event)
  })

  useResizeObserver({
    ref: simulatorRef,
    onResize: () => {
      puzzle?.resize()
      puzzle?.setCameraPosition({ phi: 6, theta: 0 })
    },
  })

  return { applyMove, simulatorRef, applyKeyboardMove }
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
