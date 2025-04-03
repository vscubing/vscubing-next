'use client'

import type { Discipline } from '@/app/_types'
import { CurrentSolve } from './current-solve'
import { Progress } from './progress'
import { SolvePanel } from './solve-panel'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { redirect, RedirectType } from 'next/navigation'
import { useSimulator } from './simulator'
import { useLocalStorage } from 'usehooks-ts'
import { toast, type Toast } from '@/app/_components/ui'
import { TRPCError } from '@trpc/server'

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
  const [seenDiscordInvite, setSeenDiscordInvite] = useLocalStorage(
    'vs-seenDiscordInvite',
    false,
  )

  const stateQuery = trpc.roundSession.state.queryOptions(
    {
      contestSlug,
      discipline,
    },
    {
      retry: (_, err) =>
        err.data?.code !== 'FORBIDDEN' && err.data?.code !== 'UNAUTHORIZED', // TODO: why does removing unauthorized result in server errors
      initialData,
    },
  )
  const {
    data: state,
    isFetching: isStateFetching,
    error,
  } = useSuspenseQuery(stateQuery)
  if (error?.data?.code === 'FORBIDDEN')
    redirect(
      `/contests/${contestSlug}/results?discipline=${discipline}`,
      RedirectType.replace,
    )

  if (error)
    throw new TRPCError({ message: error.message, code: error.data!.code })

  const { mutate: postSolveResult, isPending: isPostSolvePending } =
    useMutation(
      trpc.roundSession.postSolve.mutationOptions({
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

  const isFormPending =
    isStateFetching || isPostSolvePending || isSubmitSolvePending

  const { initSolve } = useSimulator()

  function handleInitSolve() {
    if (!state) throw new Error('handleInitSolve called with no round state')
    initSolve({ discipline, scramble: state.currentScramble.moves }, (solve) =>
      postSolveResult({
        result: solve.result,
        solution: solve.solution,
        scrambleId: state.currentScramble.id,
        contestSlug,
        discipline,
      }),
    )
  }

  async function handleSubmitSolve(
    payload:
      | { type: 'changed_to_extra'; reason: string }
      | { type: 'submitted' },
  ) {
    if (!state) throw new Error('handleSubmitSolve called with no round state')
    submitSolve({
      contestSlug,
      discipline,
      type: payload.type,
      solveId: state.currentSolve!.id,
    })

    if (
      state.submittedSolves.length === 4 &&
      payload.type === 'submitted' &&
      !seenDiscordInvite
    ) {
      toast({
        title: 'Great to have you on board',
        description:
          'Join our Discord community to connect with other cubing fans',
        contactUsButton: true,
        contactUsButtonLabel: 'Join us on Discord',
        duration: 'infinite',
        className: 'w-[23.75rem]',
      })
      setSeenDiscordInvite(true)
    }
  }

  const currentSolveNumber = (state?.submittedSolves?.length ?? 0) + 1
  return (
    <div className='flex flex-1 justify-center pl-16 pr-12'>
      <div className='flex max-w-[64rem] flex-1 flex-col'>
        <div className='mb-1 flex gap-8 pl-[calc(0.25rem*12+3.7rem)] xl-short:pl-[calc(0.25rem*6+3.7rem)]'>
          <span className='w-16 text-center text-grey-40'>Attempt</span>
          <span className='w-24 text-center text-grey-40'>Single time</span>
          <span className='text-grey-40'>Scramble</span>
        </div>
        <div className='scrollbar flex flex-1 basis-0 items-start justify-center gap-12 overflow-y-auto pr-4 xl-short:gap-6'>
          <Progress
            className='gap-12 xl-short:gap-6'
            currentSolveNumber={currentSolveNumber}
          />
          <div className='flex w-full flex-1 flex-col gap-12 xl-short:gap-6'>
            {state?.submittedSolves?.map((solve, index) => (
              <SolvePanel
                contestSlug={contestSlug}
                number={index + 1}
                result={solve.result}
                solveId={solve.id}
                position={solve.scramble.position}
                scramble={solve.scramble.moves}
                key={solve.id}
              />
            ))}

            <CurrentSolve
              contestSlug={contestSlug}
              areActionsDisabled={isFormPending}
              canChangeToExtra={state.canChangeToExtra}
              position={state.currentScramble.position}
              scramble={state.currentScramble.moves}
              solveId={state.currentSolve?.id ?? null}
              result={state.currentSolve?.result ?? null}
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
    </div>
  )
}

const SOLVE_REJECTED_TOAST = {
  title: 'Uh-oh! Solve rejected by the server',
  description: "Under normal circumstances this shouldn't happen.",
  duration: 'infinite',
  contactUsButton: true,
} satisfies Toast
