import { api } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { SolveValidator } from './_components/solve-validator'
import { db } from '@/backend/db'
import { roundTable, scrambleTable } from '@/backend/db/schema'
import { and, eq, or } from 'drizzle-orm'
import { DangerousAdminActions } from './_components/client'

export default async function DevPage() {
  const authorized = await api.admin.authorized()
  if (!authorized) notFound()

  // TODO: show docker image tag timestamp via env variable v2 & on deploy

  return (
    <div className='flex flex-1 flex-wrap justify-between gap-8 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <div className='max-w-[30rem] space-y-4'>
        This is indeed the latest app version (12)
        <h2 className='title-h2'>Ongoing contest</h2>
        <OngoingContestInfo />
        <SolveValidator />
      </div>
      <div>
        <DangerousAdminActions />
      </div>
    </div>
  )
}

export async function OngoingContestInfo() {
  const ongoingContest = await api.contest.getOngoing()
  if (!ongoingContest) return <p>No ongoing contest</p>

  const scrambles = await db
    .select()
    .from(scrambleTable)
    .innerJoin(roundTable, eq(roundTable.id, scrambleTable.roundId))
    .where(
      and(
        or(
          ...ongoingContest.disciplines.map(({ slug }) =>
            eq(roundTable.disciplineSlug, slug),
          ),
        ),
        eq(roundTable.contestSlug, ongoingContest.slug),
      ),
    )

  return (
    <>
      <pre>{JSON.stringify(ongoingContest, null, 2)}</pre>
      <h3 className='title-h3'>Scrambles</h3>
      <pre>
        {JSON.stringify(
          scrambles.map((s) => s.scramble.moves),
          null,
          2,
        )}
      </pre>
    </>
  )
}
