import { api } from '@/trpc/server'
import { PrimaryButtonWithFormStatus } from './_components/buttons-with-form-status'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { SolveValidator } from './_components/solve-validator'
import { db } from '@/backend/db'
import { roundTable, scrambleTable } from '@/backend/db/schema'
import { and, eq, or } from 'drizzle-orm'
import type { RouterInputs } from '@/trpc/react'
import {
  CloseOngoingAndCreateNewContestButton,
  CreateNewContestButton,
  CloseContestButton,
} from './_components/client'

export default async function DevPage() {
  const authorized = await api.admin.authorized()
  if (!authorized) notFound()

  // TODO: show docker image tag timestamp via env variable v2 & on deploy

  return (
    <div className='flex flex-1 flex-wrap justify-between gap-8 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <OngoingContestInfo />
      <SolveValidator
        validateSolveAction={async (
          solve: RouterInputs['admin']['validateSolveAction'],
        ) => {
          'use server'
          return api.admin.validateSolveAction(solve)
        }}
      />
    </div>
  )
}

export async function OngoingContestInfo() {
  const latestContest = await api.admin.getLatestContest()

  if (!latestContest)
    return (
      <section>
        <span>No initial contest. Please</span>
        <form
          className='ml-2 inline-block'
          action={async () => {
            'use server'
            await api.admin.createSystemInitialContest()
            revalidatePath('/dev')
          }}
        >
          <PrimaryButtonWithFormStatus size='sm'>
            Seed data
          </PrimaryButtonWithFormStatus>
        </form>
      </section>
    )

  if (latestContest.systemInitial) {
    return (
      <section>
        There is only the system initial contest. You can{' '}
        <CloseOngoingAndCreateNewContestButton>
          create
        </CloseOngoingAndCreateNewContestButton>{' '}
        the first contest.
      </section>
    )
  }

  if (!latestContest.isOngoing)
    return (
      <section>
        No ongoing contest. But you can create a{' '}
        <CreateNewContestButton>new</CreateNewContestButton> one
      </section>
    )

  const ongoingContest = await api.contest.getOngoing()
  if (!ongoingContest) throw new Error('bad ongoing contest invariant')

  const scrambles = await db
    .select()
    .from(scrambleTable)
    .innerJoin(roundTable, eq(roundTable.id, scrambleTable.roundId))
    .where(
      and(
        or(
          ...ongoingContest.disciplines.map((d) =>
            eq(roundTable.disciplineSlug, d),
          ),
        ),
        eq(roundTable.contestSlug, ongoingContest.slug),
      ),
    )

  return (
    <section>
      <div>
        <h2 className='title-h2'>Ongoing contest</h2>
        Create a{' '}
        <CloseOngoingAndCreateNewContestButton>
          new
        </CloseOngoingAndCreateNewContestButton>{' '}
        one or just
        <CloseContestButton>close</CloseContestButton> the ongoing one
      </div>
      <pre>{JSON.stringify(ongoingContest, null, 2)}</pre>
      <h3 className='title-h3'>Scrambles</h3>
      <pre>
        {JSON.stringify(
          scrambles.map((s) => s.scramble.moves),
          null,
          2,
        )}
      </pre>
    </section>
  )
}
