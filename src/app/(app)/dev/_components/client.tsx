'use client'

import { env } from '@/env'
import { SecondaryButton } from '@/frontend/ui'
import { useTRPC } from '@/trpc/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { SetStateAction } from 'jotai'
import { useState, type Dispatch, type ReactNode } from 'react'

export function CloseContestButton({ children }: { children: ReactNode }) {
  const trpc = useTRPC()
  const { mutateAsync: closeOngoingContest, isPending } = useMutation(
    trpc.admin.closeOngoingContest.mutationOptions(),
  )
  return (
    <SecondaryButton
      onClick={async () => {
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

export function CreateNewContestButton({ children }: { children: ReactNode }) {
  const trpc = useTRPC()
  const { data: latestContest, isLoading: isQueryLoading } = useQuery(
    trpc.admin.getLatestContest.queryOptions(),
  )
  const { mutateAsync: createNewContest, isPending: isMutationPending } =
    useMutation(trpc.admin.createNewContest.mutationOptions())
  const [easyScrambles, setEasyScrambles] = useState(false)
  return (
    <div className='inline-flex flex-col gap-2'>
      <SecondaryButton
        onClick={async () => {
          if (!latestContest) throw new Error('no latest contest found')
          if (latestContest.isOngoing)
            throw new Error(
              'there is an ongoing contest, please call another method that would close it and create a new one in one transaction',
            )

          await createNewContest({ easyScrambles })
          location.reload()
        }}
        disabled={isQueryLoading || isMutationPending}
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

export function CloseOngoingAndCreateNewContestButton({
  children,
}: {
  children: ReactNode
}) {
  const trpc = useTRPC()
  const { mutateAsync: closeOngoingAndCreateNewContest, isPending } =
    useMutation(trpc.admin.closeOngoingAndCreateNewContest.mutationOptions())
  const [easyScrambles, setEasyScrambles] = useState(false)

  return (
    <div className='inline-flex flex-col gap-2'>
      <SecondaryButton
        onClick={async () => {
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
