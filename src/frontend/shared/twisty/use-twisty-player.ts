import { type Discipline } from '@/types'
import { TwistyPlayer, type PuzzleID } from '@vscubing/cubing/twisty'
import { useState, useEffect } from 'react'
import { doEverything } from './solution-transformer'

export function useTwistyPlayer({
  scramble,
  solution: rawSolution,
  discipline,
}: {
  scramble: string
  solution: string
  discipline: Discipline
}) {
  const [player, setPlayer] = useState<TwistyPlayer | null>(null)

  useEffect(() => {
    void (async () => {
      const { solution, animLeaves } = await doEverything(
        scramble,
        rawSolution,
        discipline,
      )

      const newPlayer = new TwistyPlayer({
        controlPanel: 'none',
        background: 'none',
        visualization: 'PG3D',
        experimentalSetupAlg: scramble,
        alg: solution,
        puzzle: TWISTY_PUZZLE_MAP[discipline],
      })

      if (animLeaves) {
        // @ts-expect-error I know what I'm doing
        newPlayer.experimentalModel.__vscubingAnimationTimelineLeavesSet = true
        newPlayer.experimentalModel.animationTimelineLeavesRequest.set(
          animLeaves,
        )
      }

      setPlayer(newPlayer)
      return () => setPlayer(null)
    })()
  }, [scramble, rawSolution, discipline])

  return player
}

const TWISTY_PUZZLE_MAP: Record<Discipline, PuzzleID> = {
  '3by3': '3x3x3',
  '2by2': '2x2x2',
}
