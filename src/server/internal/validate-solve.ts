import type { Discipline } from '@/app/_types'
import { puzzles } from '@vscubing/cubing/puzzles'

export async function validateSolve({
  scramble,
  solution,
  discipline,
}: {
  scramble: string
  solution: string
  discipline: Discipline
}) {
  try {
    const kpuzzle = await puzzles[DISCIPLINE_TO_KPUZZLE[discipline]]!.kpuzzle()
    const isValid = kpuzzle
      .defaultPattern()
      .applyAlg(scramble)
      .applyAlg(solution)
      .experimentalIsSolved({
        ignoreCenterOrientation: true,
        ignorePuzzleOrientation: true,
      })
    return { isValid, error: null }
  } catch (error) {
    return { isValid: false, error }
  }
}

const DISCIPLINE_TO_KPUZZLE: Record<Discipline, string> = {
  '3by3': '3x3x3',
  '2by2': '2x2x2',
}
