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

export default function DevPage() {
  if (!(env.NEXT_PUBLIC_NODE_ENV === 'development')) notFound()

  return (
    <div className='flex flex-1 flex-wrap gap-8 rounded-2xl bg-black-80 p-6 sm:p-3'>
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
        No ongoing contest. But you can create a
        <NewContestButton />
      </section>
    )

  return (
    <section>
      <h2 className='title-h2'>Ongoing contest</h2>
      <pre>{JSON.stringify(ongoingContest, null, 2)}</pre>
      <NewContestButton />
    </section>
  )
}

function NewContestButton() {
  return (
    <form
      className='inline-block'
      action={async () => {
        'use server'
        await closeOngoingAndCreateNewContest(['3by3', '2by2'])
        revalidatePath('/')
      }}
    >
      <SecondaryButtonWithFormStatus size='sm' className='ml-2'>
        New contest
      </SecondaryButtonWithFormStatus>
    </form>
  )
}
