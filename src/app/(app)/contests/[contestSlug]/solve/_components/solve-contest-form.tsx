'use client'

import type { Discipline } from '@/types'
import { CurrentSolve } from './current-solve'
import { Progress } from './progress'
import { SolvePanel } from './solve-panel'
import { type RouterOutputs } from '@/trpc/react'
import { useSolveForm } from '@/frontend/shared/use-solve-form'

export function SolveContestForm({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
  initialData: RouterOutputs['roundSession']['state']
}) {
  const { state, isPending, handleSubmitSolve, handleInitSolve } = useSolveForm(
    { contestSlug, discipline },
  )

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
