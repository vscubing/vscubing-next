import { env } from '@/env'
import type { Discipline } from '@/types'
import { z } from 'zod'

export async function generateScrambles(discipline: Discipline, count: number) {
  if (!env.TNOODLE_URL) throw new Error('TNOODLE_URL missing in .env')
  return await fetch(
    `${env.TNOODLE_URL}?discipline=${discipline}&count=${count}&secret=${env.TNOODLE_SECRET}`,
  )
    .then((res) => res.json())
    .then((json) => z.array(z.string()).length(count).parse(json))
}
