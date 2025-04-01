'use client'

import type { Discipline } from '@/app/_types'
import { CurrentSolve } from './current-solve'
import { Progress } from './progress'
import { SolvePanel } from './solve-panel'
import { useTRPC } from '@/trpc/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function SolveContestForm({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const stateQuery = trpc.roundSession.state.queryOptions({
    contestSlug,
    discipline,
  })
  const {
    data: state,
    isFetching: isStateFetching,
    error,
  } = useQuery(stateQuery)

  const router = useRouter()
  if (error?.data?.code === 'FORBIDDEN')
    router.push(`/contests/${contestSlug}/results?discipline=${discipline}`)

  const { mutate: postSolveResult, isPending: isPostSolvePending } =
    useMutation(
      trpc.roundSession.postSolve.mutationOptions({
        onSettled: () => queryClient.invalidateQueries(stateQuery),
      }),
    )
  const { mutate: submitSolve, isPending: isSubmitSolvePending } = useMutation(
    trpc.roundSession.submitSolve.mutationOptions({
      onSettled: () => queryClient.invalidateQueries(stateQuery),
    }),
  )

  const isFormPending =
    isStateFetching || isPostSolvePending || isSubmitSolvePending

  // TODO: useCube

  // TODO: discord invite

  function handleInitSolve() {
    void postSolveResult({
      contestSlug,
      discipline,
      scrambleId: state!.currentScramble.id,
      solution: 'R U',
      result: {
        isDnf: false,
        timeMs: Math.floor((Math.random() * 3 + 9) * 1000),
      },
    })
    // const onSolveFinish = async (result: CubeSolveResult) => {
    //   await postSolveResult({ scrambleId: currentSolve.scramble.id, result })
    // }
    //
    // initSolve(
    //   { scramble: currentSolve.scramble.moves, discipline },
    //   (result) => void onSolveFinish(result),
    // )
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
      solveId: state!.currentSolve!.id,
    })
    //
    // if (
    //   submittedSolveSet?.length === 4 &&
    //   payload.type === 'submit' &&
    //   !seenDiscordInvite
    // ) {
    //   toast({
    //     title: 'Great to have you on board',
    //     description:
    //       'Join our Discord community to connect with other cubing fans',
    //     contactUsButton: true,
    //     contactUsButtonLabel: 'Join us on Discord',
    //     duration: 'infinite',
    //     className: 'w-[23.75rem]',
    //   })
    //   setSeenDiscordInvite(true)
    // }
  }

  if (!state) return 'Loading...'

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
                position={solve.position}
                scramble={solve.scramble}
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
