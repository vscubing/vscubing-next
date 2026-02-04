import { z } from 'zod'

const SIMPLE_MOVES = [
  'R',
  'U',
  'F',
  'B',
  'L',
  'D',
  'M',
  'E',
  'S',
  'Rw',
  'Uw',
  'Fw',
  'Bw',
  'Lw',
  'Dw',
  'x',
  'y',
  'z',
] as const

export const MOVES = SIMPLE_MOVES.flatMap(
  (move) => [move, `${move}'`, `${move}2`] as const,
)
export type Move = (typeof MOVES)[number]
export const moveSchema = z.enum(MOVES as [Move, ...Move[]])
export function isMove(moveStr: string): moveStr is Move {
  return (MOVES as readonly string[]).includes(moveStr)
}
