import { env } from '@/env'

export function removeSolutionComments(solution: string): string {
  if (solution.includes('  ') && env.NEXT_PUBLIC_APP_ENV !== 'production') {
    alert(
      '[TWISTY] double space in solution with timestamps, see console error',
    )
    throw new Error(
      `[TWISTY] double space in solution with timestamps, moves: ${solution}`,
    )
  }

  return solution
    .replace(/\/\*\d+?\*\//g, '')
    .trim()
    .replaceAll('  ', ' ') // TODO: we shouldn't need this, investigate discrepancies between cstimer and phpless-cstimer
}
