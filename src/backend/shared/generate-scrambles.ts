import { env } from '@/env'
import type { Discipline } from '@/types'
import { z } from 'zod'

export async function generateScrambles(discipline: Discipline, count: number) {
  if (!env.TNOODLE_URL || !env.TNOODLE_SECRET)
    throw new Error('TNOODLE_URL or TNOODLE_SECRET missing in .env')

  const url = new URL(env.TNOODLE_URL)
  url.searchParams.append('discipline', discipline)
  url.searchParams.append('count', String(count))
  url.searchParams.append('secret', env.TNOODLE_SECRET) // can't just do string interpolation because it doesn't escape things like + unlike url.searchParams.append

  return await fetch(url)
    .then((res) => res.json())
    .then((json) => z.array(z.string()).length(count).parse(json))
}
