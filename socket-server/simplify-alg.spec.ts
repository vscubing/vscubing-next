import { MOVES } from './move-types'
import { Alg } from '@vscubing/cubing/alg'
import { expect, test } from 'bun:test'
import { simplifyAlg } from './simplify-alg'
import { puzzles } from '@vscubing/cubing/puzzles'

test('10000 random moves', async () => {
  for (let i = 0; i < 10; i++) {
    const alg = randomMoves(10000)

    const puzzle = await puzzles['3x3x3']!.kpuzzle()
    const origPattern = puzzle.defaultPattern().applyAlg(alg)

    const res = await simplifyAlg(new Alg(alg))
    const resPattern = puzzle.defaultPattern().applyAlg(res)

    expect(resPattern.isIdentical(origPattern)).toBe(true)

    const nodes = Array.from(new Alg(res).childAlgNodes())
    expect(nodes.length).toBeLessThan(30)
  }
})

export function randomMoves(length: number) {
  return Array.from({ length })
    .map(() => MOVES[Math.floor(Math.random() * MOVES.length)])
    .join(' ')
}
