import { closeOngoingAndCreateNewContest } from '@/server/internal/close-ongoing-and-create-new-contest'
import { api } from '@/trpc/server'
import {
  PrimaryButtonWithFormStatus,
  SecondaryButtonWithFormStatus,
} from './_components/buttons-with-form-status'
import { revalidatePath } from 'next/cache'
import { env } from '@/env'
import { notFound } from 'next/navigation'
import { createSystemInitialContest } from './actions'
import { SolveValidator } from './_components/solve-validator'
import { db } from '@/server/db'
import {
  contestDisciplineTable,
  contestTable,
  scrambleTable,
} from '@/server/db/schema'
import { and, eq, or } from 'drizzle-orm'

export default function DevPage() {
  if (env.NEXT_PUBLIC_APP_ENV === 'production') notFound()

  return (
    <div className='flex flex-1 flex-wrap justify-between gap-8 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <OngoingContestInfo />
      <SolveValidator />
    </div>
  )
}

export async function OngoingContestInfo() {
  const initialContest = await api.contest.getInitialSystemContest()
  if (!initialContest)
    return (
      <section>
        <span>No initial contest. Please</span>
        <form className='ml-2 inline-block' action={createSystemInitialContest}>
          <PrimaryButtonWithFormStatus size='sm'>
            Seed data
          </PrimaryButtonWithFormStatus>
        </form>
      </section>
    )

  const ongoingContest = await api.contest.getOngoing()
  if (!ongoingContest)
    return (
      <section>
        No ongoing contest. But you can create a <NewContestButton /> one
      </section>
    )

  const scrambles = await db
    .select()
    .from(scrambleTable)
    .innerJoin(
      contestDisciplineTable,
      eq(contestDisciplineTable.id, scrambleTable.contestDisciplineId),
    )
    .where(
      and(
        or(
          ...ongoingContest.disciplines.map((d) =>
            eq(contestDisciplineTable.disciplineSlug, d),
          ),
        ),
        eq(contestDisciplineTable.contestSlug, ongoingContest.slug),
      ),
    )

  return (
    <section>
      <div>
        <h2 className='title-h2 inline-block'>Ongoing contest</h2>
        Create a <NewContestButton /> contest or <JustCloseContestButton />
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

function JustCloseContestButton() {
  return (
    <form
      className='inline-flex items-center gap-2'
      action={async () => {
        'use server'
        await db
          .update(contestTable)
          .set({ isOngoing: false })
          .where(eq(contestTable.isOngoing, true))
        revalidatePath('/')
      }}
    >
      <SecondaryButtonWithFormStatus size='sm' className='ml-2'>
        just close the onging contest
      </SecondaryButtonWithFormStatus>
    </form>
  )
}

function NewContestButton() {
  return (
    <form
      className='inline-flex flex-col gap-2'
      action={async (formData: FormData) => {
        'use server'
        const easyScrambles = formData.get('easy-scrambles') === 'on'
        await closeOngoingAndCreateNewContest(['3by3', '2by2'], easyScrambles)
        revalidatePath('/')
      }}
    >
      <SecondaryButtonWithFormStatus size='sm' className='ml-2'>
        New
      </SecondaryButtonWithFormStatus>
      <label>
        <input type='checkbox' name='easy-scrambles' />
        Easy scrambles
      </label>
    </form>
  )
}
