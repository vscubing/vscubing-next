'use client'

import type { Discipline, ResultDnfable } from '@/types'
import { CurrentSolve } from './current-solve'
import { Progress } from './progress'
import { SolvePanel } from './solve-panel'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { redirect, RedirectType } from 'next/navigation'
import { useSimulator } from './simulator'
import { toast, type Toast } from '@/frontend/ui'
import { TRPCError } from '@trpc/server'
import { SolveTimeLinkOrDnf } from '@/frontend/shared/solve-time-button'
import { signSolve } from '@/utils/solve-signature'
import { useEffect } from 'react'

export function SolveContestForm({
  contestSlug,
  discipline,
  initialData,
}: {
  contestSlug: string
  discipline: Discipline
  initialData: RouterOutputs['roundSession']['state']
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const stateQuery = trpc.roundSession.state.queryOptions(
    {
      contestSlug,
      discipline,
    },
    {
      retry: (_, err) =>
        err.data?.code !== 'FORBIDDEN' && err.data?.code !== 'UNAUTHORIZED', // TODO: why does removing unauthorized result in server errors?
      initialData,
    },
  )
  const {
    data: state,
    isFetching: isStateFetching,
    error,
  } = useSuspenseQuery(stateQuery)
  if (error?.data?.code === 'FORBIDDEN') {
    redirect(
      `/contests/${contestSlug}/results?discipline=${discipline}&scrollToOwn=true`,
      RedirectType.replace,
    )
  }

  if (error)
    throw new TRPCError({ message: error.message, code: error.data!.code })

  const { mutate: postSolveResult, isPending: isPostSolvePending } =
    useMutation(
      trpc.roundSession.postSolve.mutationOptions({
        onSuccess: (res) => {
          if (res?.setNewPersonalRecord)
            handlePersonalRecord(res.previousPersonalRecord)
        },
        onSettled: () => queryClient.invalidateQueries(stateQuery),
        onError: (error) => {
          if (error?.data?.code === 'BAD_REQUEST') toast(SOLVE_REJECTED_TOAST)
        },
      }),
    )
  const { mutate: submitSolve, isPending: isSubmitSolvePending } = useMutation(
    trpc.roundSession.submitSolve.mutationOptions({
      onSettled: () => queryClient.invalidateQueries(stateQuery),
    }),
  )

  const metadataQuery = trpc.userMetadata.userMetadata.queryOptions()
  const { data: userMetadata } = useQuery(metadataQuery)
  const { mutate: updateUserMetadata } = useMutation(
    trpc.userMetadata.updateUserMetadata.mutationOptions({
      onSettled: () => queryClient.invalidateQueries(metadataQuery),
    }),
  )

  useEffect(() => {
    // migration
    const LS_LEGACY_KEY = 'vs-seenDiscordInvite'
    if (localStorage.getItem(LS_LEGACY_KEY) === 'true') {
      updateUserMetadata({ seenDiscordInvite: true })
      localStorage.removeItem(LS_LEGACY_KEY)
    }
  }, [updateUserMetadata])

  const isFormPending =
    isStateFetching || isPostSolvePending || isSubmitSolvePending

  const { initSolve } = useSimulator()

  function handleInitSolve() {
    initSolve(
      { discipline, scramble: state.currentScramble.moves },
      (solve) => {
        return postSolveResult({
          solve: signSolve(solve),
          scrambleId: state.currentScramble.id,
          contestSlug,
          discipline,
        })
      },
    )
  }

  async function handleSubmitSolve(
    payload:
      | { type: 'changed_to_extra'; reason: string }
      | { type: 'submitted' },
  ) {
    submitSolve({
      contestSlug,
      discipline,
      type: payload.type,
      solveId: state.currentSolve!.id,
    })

    if (state.submittedSolves.length === 4 && payload.type === 'submitted') {
      handleSessionFinished()
    }
  }

  function handleSessionFinished() {
    if (!userMetadata) return

    if (!userMetadata.seenDiscordInvite) {
      toast({
        title: 'Great to have you on board',
        description:
          'Join our Discord community to connect with other vscubers',
        contactUsButton: true,
        contactUsButtonLabel: 'Discord',
        duration: 'infinite',
        className: 'w-[23.75rem]',
      })
      updateUserMetadata({ seenDiscordInvite: true })
      return
    }

    if (!userMetadata.seenSportcubingAd) {
      toast({
        title: 'Want more contests?',
        description: (
          <>
            Also check out{' '}
            <a
              href='https://sportcubing.in.ua/lang/en'
              className='border-b border-secondary-20 text-secondary-20'
            >
              Sportcubing
            </a>{' '}
            for online contests with physical puzzles
          </>
        ),
        duration: 'long',
      })
      updateUserMetadata({ seenSportcubingAd: true })
      return
    }
  }

  function handlePersonalRecord(previousPersonalRecord?: {
    id: number
    result: ResultDnfable
    contestSlug: string
  }) {
    toast({
      title: 'Wow, new personal best single!',
      description: previousPersonalRecord ? (
        <>
          Previous personal best:{' '}
          {
            <SolveTimeLinkOrDnf
              className='h-auto min-w-0'
              canShowHint={false}
              result={previousPersonalRecord.result}
              discipline={discipline}
              contestSlug={previousPersonalRecord.contestSlug}
              solveId={previousPersonalRecord.id}
            />
          }
        </>
      ) : (
        'You can check out the reconstruction by clicking on the solve time.'
      ),
      variant: 'festive',
    })
  }

  const currentSolveNumber = (state?.submittedSolves?.length ?? 0) + 1
  return (
    <div className='flex flex-1 justify-center pl-16 pr-12 md:px-8 sm:px-3'>
      <div className='grid max-w-[64rem] flex-1 grid-cols-[min-content_1fr] grid-rows-[min-content_min-content] flex-col gap-x-12 gap-y-1 sm:grid-cols-1'>
        <div className='sm:caption col-start-2 flex gap-8 pl-4 sm:col-span-full sm:gap-0 sm:pl-6'>
          <span className='w-16 text-center text-grey-40 sm:hidden'>
            Attempt
          </span>
          <span className='w-24 text-center text-grey-40 lg:w-20'>
            Single time
          </span>
          <span className='text-grey-40'>Scramble</span>
        </div>
        <Progress
          className='gap-12 xl-short:gap-6 sm:hidden'
          currentSolveNumber={currentSolveNumber}
        />
        <div className='flex w-full flex-1 flex-col gap-12 xl-short:gap-6 sm:gap-4'>
          {state?.submittedSolves?.map((solve, index) => (
            <SolvePanel
              contestSlug={contestSlug}
              discipline={discipline}
              number={index + 1}
              result={solve.result}
              solveId={solve.id}
              position={solve.scramble.position}
              scramble={solve.scramble.moves}
              isPersonalRecord={solve.isPersonalRecord}
              key={solve.id}
            />
          ))}

          <CurrentSolve
            contestSlug={contestSlug}
            discipline={discipline}
            areActionsDisabled={isFormPending}
            canChangeToExtra={state.canChangeToExtra}
            position={state.currentScramble.position}
            scramble={state.currentScramble.moves}
            solveId={state.currentSolve?.id ?? null}
            result={state.currentSolve?.result ?? null}
            isPersonalRecord={state.currentSolve?.isPersonalRecord ?? false}
            onChangeToExtra={(reason) =>
              handleSubmitSolve({ type: 'changed_to_extra', reason })
            }
            onSolveInit={handleInitSolve}
            onSolveSubmit={() => handleSubmitSolve({ type: 'submitted' })}
            number={currentSolveNumber}
          />
        </div>
      </div>
    </div>
  )
}

const SOLVE_REJECTED_TOAST = {
  title: 'Uh-oh! Solve rejected by the server',
  description:
    "Under normal circumstances this shouldn't happen. Feel free to take an extra.",
  duration: 'infinite',
  contactUsButton: true,
} satisfies Toast
