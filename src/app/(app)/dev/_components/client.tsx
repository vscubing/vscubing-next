'use client'

import { env } from '@/env'
import { Input, PrimaryButton, SecondaryButton } from '@/frontend/ui'
import { LoadingDots } from '@/frontend/ui/loading-dots'
import { useTRPC } from '@/trpc/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { SetStateAction } from 'jotai'
import { useState, type Dispatch, type ReactNode } from 'react'

export function AdminContestActions() {
  const [dangerousConfirmed, setDangerousConfirmed] = useState(
    env.NEXT_PUBLIC_APP_ENV !== 'production',
  )
  const [inputValue, setInputValue] = useState('')
  return (
    <>
      {dangerousConfirmed ? (
        <DangerousContestActionsContent />
      ) : (
        <form
          onSubmit={() => {
            if (inputValue === "I'm absolutely sure")
              setDangerousConfirmed(true)
          }}
        >
          <p>
            Manual contest management in production is dangerous. <br />
            These actions are irreversible. If you're sure, please enter:
            <br />
            <span className='font-mono'>I'm absolutely sure</span>
          </p>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="I'm absolutely sure"
          />
          <PrimaryButton>Confirm</PrimaryButton>
        </form>
      )}
    </>
  )
}

export function DangerousContestActionsContent() {
  const trpc = useTRPC()
  const { data: latestContest, isLoading } = useQuery(
    trpc.admin.getLatestContest.queryOptions(),
  )

  if (isLoading) return <LoadingDots />

  if (!latestContest)
    return (
      <section>
        <span>
          No initial contest. Please{' '}
          <CreateSystemInitialContestButton>
            seed data
          </CreateSystemInitialContestButton>
        </span>
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
        You can create a <CreateNewContestButton>new</CreateNewContestButton>{' '}
        contest
      </section>
    )

  return (
    <div>
      <CloseOngoingAndCreateNewContestButton>
        Create the ongoing and create a new contest
      </CloseOngoingAndCreateNewContestButton>{' '}
      or just
      <CloseContestButton>close the ongoing</CloseContestButton>
    </div>
  )
}

function CreateSystemInitialContestButton({
  children,
}: {
  children: ReactNode
}) {
  const trpc = useTRPC()
  const { mutate: createSystemInitialContest } = useMutation(
    trpc.admin.createSystemInitialContest.mutationOptions(),
  )
  return (
    <form>
      <PrimaryButton size='sm' onClick={() => createSystemInitialContest()}>
        {children}
      </PrimaryButton>
    </form>
  )
}

function CloseContestButton({ children }: { children: ReactNode }) {
  const trpc = useTRPC()
  const { mutateAsync: closeOngoingContest } = useMutation(
    trpc.admin.closeOngoingContest.mutationOptions(),
  )
  const [isPending, setIsPending] = useState(false)
  return (
    <SecondaryButton
      onClick={async () => {
        setIsPending(true)
        await closeOngoingContest()
        location.reload()
      }}
      disabled={isPending}
      size='sm'
      className='ml-2'
    >
      {children}
    </SecondaryButton>
  )
}

function CreateNewContestButton({ children }: { children: ReactNode }) {
  const trpc = useTRPC()
  const { data: latestContest, isLoading: isQueryLoading } = useQuery(
    trpc.admin.getLatestContest.queryOptions(),
  )
  const { mutateAsync: createNewContest } = useMutation(
    trpc.admin.createNewContest.mutationOptions(),
  )
  const [easyScrambles, setEasyScrambles] = useState(false)
  const [isPending, setIsPending] = useState(false)
  return (
    <div className='inline-flex flex-col gap-2'>
      <SecondaryButton
        onClick={async () => {
          if (!latestContest) throw new Error('no latest contest found')
          if (latestContest.isOngoing)
            throw new Error(
              'there is an ongoing contest, please call another method that would close it and create a new one in one transaction',
            )

          setIsPending(true)
          await createNewContest({ easyScrambles })
          location.reload()
        }}
        disabled={isQueryLoading || isPending}
        size='sm'
        className='ml-2'
      >
        {children}
      </SecondaryButton>
      <EasyScramblesCheckbox
        easyScrambles={easyScrambles}
        setEasyScrambles={setEasyScrambles}
      />
    </div>
  )
}

function CloseOngoingAndCreateNewContestButton({
  children,
}: {
  children: ReactNode
}) {
  const trpc = useTRPC()
  const { mutateAsync: closeOngoingAndCreateNewContest } = useMutation(
    trpc.admin.closeOngoingAndCreateNewContest.mutationOptions(),
  )
  const [isPending, setIsPending] = useState(false)
  const [easyScrambles, setEasyScrambles] = useState(false)

  return (
    <div className='inline-flex flex-col gap-2'>
      <SecondaryButton
        onClick={async () => {
          setIsPending(true)
          await closeOngoingAndCreateNewContest({ easyScrambles })
          location.reload()
        }}
        disabled={isPending}
        size='sm'
        className='ml-2'
      >
        {children}
      </SecondaryButton>
      <EasyScramblesCheckbox
        easyScrambles={easyScrambles}
        setEasyScrambles={setEasyScrambles}
      />
    </div>
  )
}

function EasyScramblesCheckbox({
  easyScrambles,
  setEasyScrambles,
}: {
  easyScrambles: boolean
  setEasyScrambles: Dispatch<SetStateAction<boolean>>
}) {
  if (env.NEXT_PUBLIC_APP_ENV === 'production')
    return (
      <span className='caption-sm'>
        (can't generate easy scrambles in production)
      </span>
    )
  return (
    <label>
      <input
        type='checkbox'
        checked={easyScrambles}
        onChange={(e) => setEasyScrambles(e.target.checked)}
      />
      Easy scrambles
    </label>
  )
}
