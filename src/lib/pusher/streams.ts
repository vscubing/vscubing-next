import { DISCIPLINES } from '@/types'
import { z } from 'zod'

export type SolveStream = z.infer<typeof solveStreamSchema>
export const solveStreamSchema = z.object({
  discipline: z.enum(DISCIPLINES),
  scramble: z.string(),
  streamId: z.string(),
  ended: z.boolean(),
})
