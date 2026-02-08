import { notFound } from 'next/navigation'
import { ReplayViewer, type ReplayData } from './_components/replay-viewer'
import { castDiscipline } from '@/types'
import { z } from 'zod'

const replayParamsSchema = z.object({
  discipline: z.string().optional(),
  scramble: z.string().min(1),
  solution: z.string().min(1),
  timeMs: z.coerce.number().positive(),
  username: z.string().optional(),
  date: z.coerce.number().optional(),
})

export default async function ReplayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const result = replayParamsSchema.safeParse(params)

  if (!result.success) {
    notFound()
  }

  const { discipline, scramble, solution, timeMs, username, date } = result.data

  const data: ReplayData = {
    discipline: castDiscipline(discipline),
    scramble,
    solution,
    timeMs,
    isDnf: false,
    username,
    date,
  }

  return <ReplayViewer data={data} />
}
