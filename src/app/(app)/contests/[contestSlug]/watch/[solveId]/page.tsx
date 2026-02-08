import { z } from 'zod'
import { api } from '@/lib/trpc/server'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { notFound } from 'next/navigation'
import { LoadingSpinner } from '@/frontend/ui'
import { castDiscipline } from '@/types'
import { Suspense } from 'react'
import {
  ReplayViewer,
  ReplayLoadingShell,
  type ReplayData,
} from '@/app/(app)/replay/_components/replay-viewer'

type PathParams = { contestSlug: string; solveId: string }
export default async function WatchSolvePage(props: {
  params: Promise<PathParams>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { contestSlug, solveId } = await props.params
  const searchParams = await props.searchParams
  const discipline = castDiscipline(searchParams.discipline)

  return (
    <Suspense
      fallback={
        <ReplayLoadingShell
          discipline={discipline}
          contestSlug={contestSlug}
          scramblePosition='...'
        >
          <div className='col-span-full flex items-center justify-center rounded-2xl bg-black-80'>
            <LoadingSpinner />
          </div>
        </ReplayLoadingShell>
      }
    >
      <PageContent solveId={solveId} contestSlug={contestSlug} />
    </Suspense>
  )
}

async function PageContent({ solveId, contestSlug }: PathParams) {
  const { data, error } = await tryCatchTRPC(
    api.contest.getSolve({ solveId: Number(solveId) }),
  )
  if (error?.code === 'NOT_FOUND' || error?.code === 'BAD_REQUEST') notFound()
  if (error) throw error
  const { solve } = data

  const replayData: ReplayData = {
    discipline: solve.discipline,
    scramble: solve.scramble,
    solution: solve.solution,
    timeMs: solve.timeMs,
    isDnf: false,
    username: solve.user.name,
    contestSlug,
    roundSessionId: solve.roundSessionId,
    scramblePosition: expandScramblePosition(solve.position),
    isOwn: solve.isOwn,
    isPersonalRecord: solve.isPersonalRecord,
  }

  return <ReplayViewer data={replayData} />
}

function expandScramblePosition(position?: string): string {
  if (!position) {
    return ''
  }
  const result = z
    .enum(['1', '2', '3', '4', '5', 'E1', 'E2'])
    .safeParse(position)
  if (!result.success) {
    throw Error('invalid scramble position')
  }
  if (result.data === 'E1') {
    return 'Extra 1'
  }
  if (result.data === 'E2') {
    return 'Extra 2'
  }
  return position
}
