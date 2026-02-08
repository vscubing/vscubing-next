import { notFound } from 'next/navigation'
import { ReplayViewer, type ReplayData } from '../_components/replay-viewer'
import { api } from '@/lib/trpc/server'
import { tryCatchTRPC } from '@/lib/utils/try-catch'

export default async function ShortReplayPage({
  params,
}: {
  params: Promise<{ shortId: string }>
}) {
  const { shortId } = await params

  const { data: link, error } = await tryCatchTRPC(
    api.replayLink.get({ id: shortId }),
  )

  if (error?.code === 'NOT_FOUND') notFound()
  if (error) throw error

  const data: ReplayData = {
    discipline: link.discipline,
    scramble: link.scramble,
    solution: link.solution,
    timeMs: link.timeMs,
    isDnf: false,
    username: link.username ?? undefined,
    date: link.date ?? undefined,
  }

  return <ReplayViewer data={data} />
}
