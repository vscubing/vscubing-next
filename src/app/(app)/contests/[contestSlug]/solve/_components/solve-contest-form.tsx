'use client'

import type { Discipline } from '@/types'
import { CurrentSolve } from './current-solve'
import { Progress } from './progress'
import { SolvePanel } from './solve-panel'
import { useSolveForm } from '@/frontend/shared/use-solve-form'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/react'

export function SolveContestForm({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const { state, isPending, handleSubmitSolve, handleInitSolve } = useSolveForm(
    { contestSlug, discipline },
  )

  const trpc = useTRPC()

  const metadataQuery = trpc.userMetadata.userMetadata.queryOptions()
  const { data: userMetadata } = useQuery(metadataQuery)

  if (!state) return // TODO: remove this if we make useSolveForm use useSuspenseQuery (see https://github.com/t3-oss/create-t3-app/issues/1765)

  if (userMetadata?.suspended) {
    return (
      <p className='title-lg fixed inset-16 z-[10000] flex flex-1 flex-col items-center justify-center rounded-xl bg-black-100 text-center'>
        Your account was suspended!
        <br /> Go do something productive. <br />
        <span className='mt-2 text-lg text-grey-60'>
          P.S. if this is a mistake please{' '}
          <a
            className='text-primary-100 underline'
            href='https://discord.gg/PxFrW9vTAy'
          >
            let us know
          </a>
          , we'll fix it ASAP
        </span>
      </p>
    ) // this is an ad hoc solution for a friend who asked me to suspend his account
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
            areActionsDisabled={isPending}
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
