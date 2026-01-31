'use client'

import { RoundSessionRow } from '@/frontend/shared/round-session-row'
import { useSolveForm } from '@/frontend/shared/use-solve-form'
import { type RouterOutputs } from '@/lib/trpc/react'
import { type Discipline, getExtraNumber } from '@/types'
import { PrimaryButton, SecondaryButton, Ellipsis } from '@/frontend/ui'
import { ExtraPrompt } from '../../solve/_components/extra-prompt'
import { SolveTimeLinkOrDnf } from '@/frontend/shared/solve-time-link-or-dnf'
import { OwnAttemptsPopover } from './own-attempts-popover'

export function OwnRoundSessionInProgressRow({
  discipline,
  session,
  place,
  contestSlug,
}: {
  discipline: Discipline
  session: RouterOutputs['contest']['getContestResults'][number]
  place: number
  contestSlug: string
}) {
  const { state, isPending, handleSubmitSolve } = useSolveForm({
    contestSlug,
    discipline,
  })

  if (!state?.currentSolve) {
    return (
      <RoundSessionRow
        session={session}
        place={place}
        discipline={discipline}
        podiumColors
        isFirstOnPage={false}
        revealedAttemptsNumber={session.solves.length}
        className='h-[5.5rem] rounded-xl sm:h-auto'
        sticky
        isPlacePreliminary
      />
    )
  }

  const currentSolveNumber = (state.submittedSolves?.length ?? 0) + 1
  const extraNumber = getExtraNumber(state.currentScramble.position)

  return (
    <li className='sticky bottom-4 top-[calc(var(--layout-section-header-height)-2px)] z-10 flex h-[5.5rem] flex-col gap-1 rounded-xl border border-dashed border-secondary-20 bg-black-80 p-2 sm:h-auto'>
      <div className='flex items-center'>
        <span className='w-24 sm:w-16 text-center text-grey-40'>Attempt</span>
        <span className='w-32 sm:w-20 text-center text-grey-40'>Single time</span>
        <span className='flex-1 pl-4 text-left text-grey-40 sm:hidden'>Scramble</span>
        <div className='h-6 ml-auto'>
          <OwnAttemptsPopover
            submittedSolves={state.submittedSolves}
            contestSlug={contestSlug}
            discipline={discipline}
          />
        </div>
      </div>
      <div className='flex h-11 items-center rounded-xl bg-grey-100'>
        <span className='vertical-alignment-fix relative w-24 text-center text-[1rem] sm:w-16'>
          No {currentSolveNumber}
        </span>
        <div className='h-6 w-px bg-grey-60' />
        <div className='flex w-32 justify-center sm:w-auto'>
          <SolveTimeLinkOrDnf
            result={state.currentSolve.result}
            solveId={state.currentSolve.id}
            contestSlug={contestSlug}
            discipline={discipline}
            canShowHint={false}
            isFestive={state.currentSolve.isPersonalRecord}
            extraNumber={extraNumber}
            backgroundColorClass='bg-grey-100'
          />
        </div>
        <div className='h-6 w-px bg-grey-60 sm:hidden' />
        <Ellipsis className='vertical-alignment-fix flex-1 px-4 sm:hidden'>
          {state.currentScramble.moves}
        </Ellipsis>
        <div className='flex h-full gap-1 ml-auto'>
          {state.canChangeToExtra && (
            <ExtraPrompt
              onSubmit={(reason) =>
                handleSubmitSolve({ type: 'changed_to_extra', reason })
              }
              trigger={
                <SecondaryButton
                  size='sm'
                  className='h-full w-[5.25rem]'
                  disabled={isPending}
                >
                  Extra
                </SecondaryButton>
              }
            />
          )}
          <PrimaryButton
            size='sm'
            className='h-full w-[5.25rem]'
            onClick={() => handleSubmitSolve({ type: 'submitted' })}
            disabled={isPending}
            autoFocus
          >
            Submit
          </PrimaryButton>
        </div>
      </div>
    </li>
  )
}
