import { env } from '@/env'
import { DISCIPLINES, type Move } from '@/types'
import { z } from 'zod'

export type SolveStream = z.infer<typeof solveStreamSchema>
export const solveStreamSchema = z.object({
  discipline: z.enum(DISCIPLINES),
  scramble: z.string(),
  streamId: z.string(),
  ended: z.boolean(),
})

export type SolveStreamMove = {
  move: Move
  idx: number
  event?: 'solve-start' | 'solve-end'
}

export const LIVE_STREAMS_ENABLED = env.NEXT_PUBLIC_APP_ENV !== 'production'
export const CUBE_TOGETHER_ENABLED = env.NEXT_PUBLIC_APP_ENV !== 'production'
