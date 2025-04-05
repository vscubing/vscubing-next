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

export default function DevPage() {
  if (!(env.NEXT_PUBLIC_NODE_ENV === 'development')) notFound()

  return (
    <div className='flex flex-1 flex-col gap-3 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <DevPageContent />
    </div>
  )
}

export async function DevPageContent() {
  const initialContest = await api.contest.getInitialSystemContest()
  if (!initialContest)
    return (
      <div>
        <span>No initial contest. Please</span>
        <form className='ml-2 inline-block' action={createSystemInitialContest}>
          <PrimaryButtonWithFormStatus size='sm'>
            Seed data
          </PrimaryButtonWithFormStatus>
        </form>
      </div>
    )

  const ongoingContest = await api.contest.getOngoing()
  if (!ongoingContest)
    return (
      <div>
        No ongoing contest. But you can create a
        <NewContestButton />
      </div>
    )

  return (
    <>
      <h1 className='title-h2'>Ongoing contest</h1>
      <pre>{JSON.stringify(ongoingContest, null, 2)}</pre>
      <NewContestButton />
    </>
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
