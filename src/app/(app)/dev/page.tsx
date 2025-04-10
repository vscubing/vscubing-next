import {
  closeOngoingAndCreateNewContest,
  closeOngoingContest,
  createNewContest,
  getLatestContest,
  getNextContestSlug,
} from '@/backend/shared/contest-management'
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
import { db } from '@/backend/db'
import { roundTable, scrambleTable } from '@/backend/db/schema'
import { and, eq, or } from 'drizzle-orm'
import { Suspense, type ReactNode } from 'react'

type SearchParams = Promise<Record<string, string | string[] | undefined>>
export default async function DevPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  await searchParams // hack to opt out of prerendering during build
  if (env.NEXT_PUBLIC_APP_ENV === 'production') notFound()
  // TODO: allow access for admins

  return (
    <div className='flex flex-1 flex-wrap justify-between gap-8 rounded-2xl bg-black-80 p-6 sm:p-3'>
      {/* TODO: disable prerendering of this somehow */}
      <Suspense fallback='fallback'>
        <OngoingContestInfo />
        <SolveValidator />
      </Suspense>
    </div>
  )
}

export async function OngoingContestInfo() {
  console.log('wtf')
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
