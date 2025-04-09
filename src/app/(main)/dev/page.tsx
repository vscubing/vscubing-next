import {
  closeOngoingAndCreateNewContest,
  closeOngoingContest,
  createNewContest,
  getLatestContest,
  getNextContestSlug,
} from '@/server/internal/ongoing-contest-admin'
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
import { contestDisciplineTable, scrambleTable } from '@/server/db/schema'
import { and, eq, or } from 'drizzle-orm'
import { Suspense, type ReactNode } from 'react'

export const ssg = false

export default function DevPage() {
  if (env.NEXT_PUBLIC_APP_ENV === 'production') notFound()

  return (
    <div className='flex flex-1 flex-wrap justify-between gap-8 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <Suspense>
        <OngoingContestInfo />
        <SolveValidator />
      </Suspense>
    </div>
  )
}

export async function OngoingContestInfo() {
  const latestContest = await getLatestContest()

  if (!latestContest)
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

  if (latestContest?.isOngoing === false)
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

function CloseContestButton({ children }: { children: ReactNode }) {
  return (
    <form
      className='inline-flex items-center gap-2'
      action={async () => {
        'use server'
        await closeOngoingContest()
        revalidatePath('/')
      }}
    >
      <SecondaryButtonWithFormStatus size='sm' className='ml-2'>
        {children}
      </SecondaryButtonWithFormStatus>
    </form>
  )
}

function CreateNewContestButton({ children }: { children: ReactNode }) {
  return (
    <form
      className='inline-flex flex-col gap-2'
      action={async (formData: FormData) => {
        'use server'
        const latestContest = await getLatestContest()

        if (!latestContest) throw new Error('no latest contest found')
        if (latestContest.isOngoing)
          throw new Error(
            'there is an ongoing contest, please call another method that would close it and create a new one in one transaction',
          )

        const easyScrambles = formData.get('easy-scrambles') === 'on'
        await createNewContest({
          easyScrambles,
          slug: getNextContestSlug(latestContest.slug),
        })
        revalidatePath('/')
      }}
    >
      <SecondaryButtonWithFormStatus size='sm' className='ml-2'>
        {children}
      </SecondaryButtonWithFormStatus>
      <label>
        <input type='checkbox' name='easy-scrambles' />
        Easy scrambles
      </label>
    </form>
  )
}

function CloseOngoingAndCreateNewContestButton({
  children,
}: {
  children: ReactNode
}) {
  return (
    <form
      className='inline-flex flex-col gap-2'
      action={async (formData: FormData) => {
        'use server'
        const easyScrambles = formData.get('easy-scrambles') === 'on'
        await closeOngoingAndCreateNewContest(easyScrambles)
        revalidatePath('/')
      }}
    >
      <SecondaryButtonWithFormStatus size='sm' className='ml-2'>
        {children}
      </SecondaryButtonWithFormStatus>
      <label>
        <input type='checkbox' name='easy-scrambles' />
        Easy scrambles
      </label>
    </form>
  )
}
