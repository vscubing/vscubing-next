import { api } from '@/trpc/server'
import {
  PrimaryButtonWithFormStatus,
  SecondaryButtonWithFormStatus,
} from './_components/buttons-with-form-status'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { SolveValidator } from './_components/solve-validator'
import { db } from '@/backend/db'
import { roundTable, scrambleTable } from '@/backend/db/schema'
import { and, eq, or } from 'drizzle-orm'
import { type ReactNode } from 'react'
import type { RouterInputs } from '@/trpc/react'

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

function CloseContestButton({ children }: { children: ReactNode }) {
  return (
    <form
      className='inline-flex items-center gap-2'
      action={async () => {
        'use server'
        await api.admin.closeOngoingContest()
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
        const latestContest = await api.admin.getLatestContest()

        if (!latestContest) throw new Error('no latest contest found')
        if (latestContest.isOngoing)
          throw new Error(
            'there is an ongoing contest, please call another method that would close it and create a new one in one transaction',
          )

        const easyScrambles = formData.get('easy-scrambles') === 'on'
        await api.admin.createNewContest({ easyScrambles })
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
        await api.admin.closeOngoingAndCreateNewContest({ easyScrambles })
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
