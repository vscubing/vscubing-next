import { SolvePanel } from './solve-panel'
import { PrimaryButton, SecondaryButton } from '@/frontend/ui'
import type { ScramblePosition, ResultDnfish, Discipline } from '@/types'
import { ExtraPrompt } from './extra-prompt'

export function CurrentSolve({
  areActionsDisabled,
  number,
  canChangeToExtra,
  position,
  result,
  solveId,
  scramble,
  isPersonalBest,
  onChangeToExtra,
  onSolveInit,
  onSolveSubmit,
  contestSlug,
  discipline,
}: {
  areActionsDisabled: boolean
  number: number
  canChangeToExtra: boolean
  scramble: string
  position: ScramblePosition
  result: ResultDnfish | null
  isPersonalBest: boolean
  solveId: number | null
  onChangeToExtra: (reason: string) => void
  onSolveInit: () => void
  onSolveSubmit: () => void
  contestSlug: string
  discipline: Discipline
}) {
  return (
    <SolvePanel
      contestSlug={contestSlug}
      discipline={discipline}
      number={number}
      scramble={scramble}
      position={position}
      result={result}
      isPersonalBest={isPersonalBest}
      solveId={solveId}
      renderAction={
        <SolveAction
          result={result}
          disabled={areActionsDisabled}
          onSolveSubmit={onSolveSubmit}
          onSolveInit={onSolveInit}
          onChangeToExtra={onChangeToExtra}
          canChangeToExtra={canChangeToExtra}
        />
      }
    />
  )
}

function SolveAction({
  result,
  disabled,
  canChangeToExtra,
  onSolveInit,
  onChangeToExtra,
  onSolveSubmit,
}: {
  disabled: boolean
  result: ResultDnfish | null
  canChangeToExtra: boolean
  onSolveInit: () => void
  onSolveSubmit: () => void
  onChangeToExtra: (reason: string) => void
}) {
  if (result === null)
    return (
      <PrimaryButton
        size='sm'
        onClick={onSolveInit}
        disabled={disabled}
        autoFocus
      >
        Solve
      </PrimaryButton>
    )

  return (
    <div className='flex gap-1'>
      {canChangeToExtra && (
        <ExtraPrompt
          onSubmit={onChangeToExtra}
          trigger={
            <SecondaryButton
              size='sm'
              className='w-[5.25rem]'
              disabled={disabled}
            >
              Extra
            </SecondaryButton>
          }
        />
      )}
      <PrimaryButton
        size='sm'
        className='w-[5.25rem]'
        onClick={onSolveSubmit}
        disabled={disabled}
        autoFocus
      >
        Submit
      </PrimaryButton>
    </div>
  )
}
