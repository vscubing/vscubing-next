import { env } from '@/env'

export function removeComments(moves: string): string {
  if (moves.includes('  ') && env.NEXT_PUBLIC_NODE_ENV !== 'production') {
    alert(
      '[TWISTY] double space in reconstruction with timestamps, see console error',
    )
    throw new Error(
      `[TWISTY] double space in reconstruction with timestamps, moves: ${moves}`,
    )
  }

  return moves
    .replace(/\/\*\d+?\*\//g, '')
    .trim()
    .replaceAll('  ', ' ') // TODO: we shouldn't need this, investigate discrepancies between cstimer and phpless-cstimer
}
