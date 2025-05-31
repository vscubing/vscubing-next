'use client'

import { env } from '@/env'
import { Input, PrimaryButton, SecondaryButton } from '@/frontend/ui'
import { LoadingDots } from '@/frontend/ui/loading-dots'
import { useTRPC, type RouterInputs } from '@/lib/trpc/react'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { SetStateAction } from 'jotai'
import { ArrowDownIcon } from 'lucide-react'
import { useState, useTransition, type Dispatch, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

export function DangerousAdminActions() {
  const [dangerousConfirmed, setDangerousConfirmed] = useState(
    env.NEXT_PUBLIC_APP_ENV !== 'production',
  )
  const [inputValue, setInputValue] = useState('')
  return (
    <>
      {dangerousConfirmed ? (
        <DangerousAdminActionsUnlocked />
      ) : (
        <form
          onSubmit={() => {
            if (inputValue === "I'm absolutely sure")
              setDangerousConfirmed(true)
          }}
        >
          <p>
            <DangerWarning />
            <p>If you're sure, please enter:</p>
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

function DangerWarning() {
  return (
    <>
      <p className='title-h2 font-bold'>
        <h1 className='text-red-80'>❗❗❗DANGER❗❗❗</h1>
        <p>Using these admin actions in production is dangerous.</p>{' '}
        <p className='text-red-80'>
          Please make a DB backup before touching anything here.
        </p>{' '}
        <p>These actions are irreversible.</p>
      </p>
    </>
  )
}

function DangerousAdminActionsUnlocked() {
  return (
    <div className='space-y-8'>
      {env.NEXT_PUBLIC_APP_ENV === 'production' && <DangerWarning />}
      <div className='border-y border-white-100 py-8'>
        <DangerousContestActions />
      </div>
      <div className='border-b border-white-100 py-8'>
        <DangerousTransferUserResults />
      </div>
    </div>
  )
}

function DangerousTransferUserResults() {
  const { register, handleSubmit } =
    useForm<RouterInputs['admin']['transferUserResults']>()
  const trpc = useTRPC()
  const { mutateAsync: transferUserResults } = useMutation(
    trpc.admin.transferUserResults.mutationOptions(),
  )
  const [isPending, startTransition] = useTransition()
  const [res, setRes] = useState<string | undefined>()

  function onSubmit({
    sourceUserName,
    targetUserName,
  }: RouterInputs['admin']['transferUserResults']) {
    startTransition(async () => {
      const { data, error } = await tryCatchTRPC(
        transferUserResults({
          sourceUserName,
          targetUserName,
        }),
      )
      if (error) setRes(JSON.stringify(error, null, 2))
      else
        setRes(
          JSON.stringify(data.mergedMsg, null, 2) +
            '\n\n' +
            JSON.stringify(data.conflictMsg, null, 2),
        )
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex w-[30rem] flex-col gap-2'
    >
      <h2 className='title-h2'>Transfer user results</h2>
      <Input
        placeholder='Source user name (will lose their results)'
        required
        {...register('sourceUserName')}
      />
      <ArrowDownIcon />
      <Input
        placeholder="Target user name (will receive source's results)"
        required
        {...register('targetUserName')}
      />
      <PrimaryButton disabled={isPending} type='submit' size='sm'>
        Submit
      </PrimaryButton>
      <pre>{res}</pre>
    </form>
  )
}

function DangerousContestActions() {
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
        Close the ongoing and create a new contest
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
