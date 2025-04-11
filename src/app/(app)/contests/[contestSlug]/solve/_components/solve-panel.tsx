import { Ellipsis, CheckIcon } from '@/frontend/ui'
import { ExtraLabel } from '@/frontend/shared/extra-label'
import {
  SolveTimeLabel,
  SolveTimeLinkOrDnf,
} from '@/frontend/shared/solve-time-button'
import type { ScramblePosition, ResultDnfish, Discipline } from '@/types'
import { type ReactNode } from 'react'

export function SolvePanel({
  number,
  isPersonalBest,
  position,
  scramble,
  solveId,
  result,
  renderAction,
  contestSlug,
  discipline,
}: {
  number: number
  isPersonalBest: boolean
  solveId: number | null
  result: ResultDnfish | null
  position: ScramblePosition
  scramble: string
  renderAction?: ReactNode
  contestSlug: string
  discipline: Discipline
}) {
  return (
    <div className='flex h-11 items-center gap-8 rounded-xl bg-grey-100 pl-4'>
      <span className='vertical-alignment-fix relative flex h-full min-w-16 items-center justify-center after:absolute after:-right-4 after:h-6 after:w-px after:bg-grey-60'>
        No {number}
        <ExtraLabel
          scramblePosition={position}
          className='absolute right-0 top-0'
        />
      </span>
      <TimeSection
        result={result}
        id={solveId}
        isPersonalBest={isPersonalBest}
        contestSlug={contestSlug}
        discipline={discipline}
      />
      {!!result ? (
        <Ellipsis className='vertical-alignment-fix flex-1'>
          {scramble}
        </Ellipsis>
      ) : (
        <span className='vertical-alignment-fix text-grey-40'>
          Your scramble will be displayed here after you start solving
        </span>
      )}
      <div className='ml-auto'>
        {renderAction ?? <CheckIcon className='mr-4 text-primary-80' />}
      </div>
    </div>
  )
}

type TimeSectionProps = {
  contestSlug: string
  discipline: Discipline
  id: number | null
  result: ResultDnfish | null
  isPersonalBest: boolean
}
function TimeSection({
  result,
  id,
  contestSlug,
  isPersonalBest,
  discipline,
}: TimeSectionProps) {
  if (!result || !id) {
    return <SolveTimeLabel isPlaceholder />
  }
  if (result.isDnf) {
    return <SolveTimeLabel isDnf />
  }
  return (
    <SolveTimeLinkOrDnf
      canShowHint={false}
      contestSlug={contestSlug}
      solveId={id}
      isFestive={isPersonalBest}
      result={result}
      discipline={discipline}
    />
  )
}
